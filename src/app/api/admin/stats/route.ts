import { isAdmin } from "@/lib/auth";
import { splitAmount } from "@/lib/fees";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [totalUsers, totalEvents, pendingEvents, approvedEvents, rejectedEvents, totalRsvps, paid, failedPayments] =
    await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.event.count({ where: { status: "PENDING" } }),
      prisma.event.count({ where: { status: "APPROVED" } }),
      prisma.event.count({ where: { status: "REJECTED" } }),
      prisma.rSVP.count(),
      prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
      prisma.payment.count({ where: { status: "FAILED" } }),
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
