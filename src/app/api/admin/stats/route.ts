import { isAdmin } from "@/lib/auth";
import { splitAmount } from "@/lib/fees";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

import { EventStatus, PaymentStatus } from "@prisma/client";
export async function GET(req: Request) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [totalUsers, totalEvents, pendingEvents, approvedEvents, rejectedEvents, totalRsvps, paid, failedPayments] =
    await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.event.count({ where: { status: EventStatus.PENDING } }),
      prisma.event.count({ where: { status: EventStatus.APPROVED } }),
      prisma.event.count({ where: { status: EventStatus.REJECTED } }),
      prisma.rSVP.count(),
      prisma.payment.aggregate({ where: { status: PaymentStatus.PAID }, _sum: { amount: true }, _count: true }),
      prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
    ]);
  const grossSales = paid._sum.amount ?? 0;

  return NextResponse.json({
    totalUsers,
    totalEvents,
    pendingEvents,
    approvedEvents,
    rejectedEvents,
    totalRsvps,
    grossSales,
    platformFee: splitAmount(grossSales).platformFee,
    paidPayments: paid._count,
    failedPayments,
  });
}
