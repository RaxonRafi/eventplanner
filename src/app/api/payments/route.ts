/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuth } from "@/lib/auth";
import { splitAmount } from "@/lib/fees";
import prisma from "@/lib/prisma";
import { PaymentStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * Payments list for the dashboard.
 * ADMIN sees every payment; ORGANIZER sees payments for their own events.
 * Query: ?status=PAID|FAILED|CANCELLED|UNPAID|REFUNDED&page=&limit=
 */
export async function GET(req: Request) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.role !== Role.ADMIN && auth.role !== Role.ORGANIZER)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") || undefined;
  if (statusParam && !(Object.values(PaymentStatus) as string[]).includes(statusParam))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const status = statusParam as PaymentStatus | undefined;

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));

  const scope = auth.role === Role.ORGANIZER ? { rsvp: { event: { organizerId: auth.id } } } : {};
  const where = { ...scope, ...(status ? { status } : {}) };

  try {
    const [total, rows, byStatus] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          tranId: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          rsvp: {
            select: {
              user: { select: { name: true, email: true } },
              event: { select: { id: true, title: true } },
              package: { select: { name: true } },
            },
          },
        },
      }),
      prisma.payment.groupBy({
        by: ["status"],
        where: scope,
        _count: { _all: true },
        _sum: { amount: true },
      }),
    ]);

    const paidGross = byStatus.find((s) => s.status === PaymentStatus.PAID)?._sum.amount ?? 0;
    const counts = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all]));

    return NextResponse.json({
      data: rows.map((p) => ({ ...p, ...splitAmount(p.amount) })),
      summary: { ...splitAmount(paidGross), gross: paidGross, counts },
      meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (e: any) {
    console.error("[GET payments]", e?.message);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
