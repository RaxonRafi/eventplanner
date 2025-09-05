/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { SSLService } from "@/services/paymentService";
import { PaymentStatus, RSVPStatus } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

if (!process.env.NEXTAUTH_SECRET) throw new Error("NEXTAUTH_SECRET is not set");
const JWT_SECRET = process.env.NEXTAUTH_SECRET;

type JwtPayload = { id: string; role: "USER" | "ADMIN" | "ORGANIZER" | string };

const CreateSchema = z.object({
  eventId: z.string().min(1),
  packageId: z.string().min(1),
});

export async function POST(req: Request) {
  // auth
  const token = (await cookies()).get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let user: JwtPayload;
  try {
    user = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // input
  const body = CreateSchema.parse(await req.json());
  const tranId = `TXN-${uuidv4()}`;

  // load + validate event/package
  const event = await prisma.event.findUnique({
    where: { id: body.eventId },
    select: { id: true, title: true, date: true, capacity: true },
  });
  if (!event)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.date < new Date())
    return NextResponse.json(
      { error: "Event already occurred" },
      { status: 400 }
    );
  if (event.capacity != null) {
    const confirmed = await prisma.rSVP.count({
      where: { eventId: event.id, status: RSVPStatus.CONFIRMED },
    });
    if (confirmed >= event.capacity)
      return NextResponse.json(
        { error: "Event is at capacity" },
        { status: 409 }
      );
  }
  const pkg = await prisma.eventPackage.findUnique({
    where: { id: body.packageId },
    select: { id: true, price: true, eventId: true },
  });
  if (!pkg)
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  if (pkg.eventId !== event.id)
    return NextResponse.json(
      { error: "Package does not belong to this event" },
      { status: 400 }
    );

  // amounts
  const amountBDT = Number(pkg.price.toFixed(2)); // for gateway
  const amountPaisa = Math.round(amountBDT * 100); // for DB (Int)

  try {
    // DB: RSVP + Payment (UNPAID) — atomic
    const { rsvp, payment } = await prisma.$transaction(async (tx) => {
      const rsvp = await tx.rSVP.create({
        data: {
          userId: user.id,
          eventId: event.id,
          packageId: pkg.id,
          status: RSVPStatus.PENDING,
          paid: false,
        },
      });
      const payment = await tx.payment.create({
        data: {
          rsvpId: rsvp.id,
          amount: amountPaisa,
          currency: "BDT",
          status: PaymentStatus.UNPAID,
          tranId,
        },
        select: { id: true, tranId: true },
      });
      return { rsvp, payment };
    });

    // Gateway init (outside transaction)
    const buyer = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true },
    });
    const init = await SSLService.sslPaymentInit({
      amount: amountBDT, // BDT with 2 decimals (service will format)
      transactionId: tranId,
      name: buyer?.name ?? "Customer",
      email: buyer?.email ?? "noreply@example.com",
    });
    const paymentUrl = init.GatewayPageURL ;

    if (!paymentUrl) {
      await prisma.payment
        .update({
          where: { tranId },
          data: {
            status: PaymentStatus.FAILED,
            paymentGatewayData: "Init failed: no GatewayPageURL",
          },
        })
        .catch(() => {});
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 502 }
      );
    }

    return NextResponse.json({ paymentUrl, rsvp, payment }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002")
      return NextResponse.json(
        { error: "You already have an RSVP for this event" },
        { status: 409 }
      );
    await prisma.payment
      .updateMany({
        where: { tranId },
        data: {
          status: PaymentStatus.FAILED,
          paymentGatewayData: "Server error before init",
        },
      })
      .catch(() => {});
      console.log(err);
    return NextResponse.json(
      { error: "Failed to create RSVP" },
      { status: 500 }
    );
  }
}
