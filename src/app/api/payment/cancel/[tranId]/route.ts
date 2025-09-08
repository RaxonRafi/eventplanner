import prisma from "@/lib/prisma";
import { PaymentStatus, RSVPStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tranId: string }> }
) {
  const { tranId } = await params;

  const payment = await prisma.payment
    .update({
      where: { tranId },
      data: { status: PaymentStatus.CANCELLED },
      select: { rsvpId: true },
    })
    .catch(() => null);

  if (payment?.rsvpId) {
    await prisma.rSVP
      .update({
        where: { id: payment.rsvpId },
        data: { status: RSVPStatus.PENDING, paid: false },
      })
      .catch(() => {});
  }

  return NextResponse.json({ success: true, message: "Payment Cancelled" });
}
