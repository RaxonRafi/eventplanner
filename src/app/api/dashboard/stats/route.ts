import { getAuth } from "@/lib/auth";
import { splitAmount } from "@/lib/fees";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/** Overview numbers for /dashboard — organizer earnings, or a user's bookings. */
export async function GET(req: Request) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date();

  if (auth.role === "ORGANIZER" || auth.role === "ADMIN") {
    const own = { organizerId: auth.id };
    const [events, bookings, paid, upcoming] = await Promise.all([
      prisma.event.groupBy({ by: ["status"], where: own, _count: { _all: true } }),
      prisma.rSVP.count({ where: { event: own, status: "CONFIRMED" } }),
      prisma.payment.aggregate({
        where: { status: "PAID", rsvp: { event: own } },
        _sum: { amount: true },
      }),
      prisma.event.findMany({
        where: { ...own, date: { gte: now } },
        orderBy: { date: "asc" },
        take: 5,
        select: {
          id: true,
          title: true,
          date: true,
          status: true,
          capacity: true,
          _count: { select: { rsvps: { where: { status: "CONFIRMED" } } } },
        },
      }),
    ]);
    const count = (s: string) => events.find((e) => e.status === s)?._count._all ?? 0;
    const gross = paid._sum.amount ?? 0;
    return NextResponse.json({
      role: "ORGANIZER",
      totalEvents: events.reduce((n, e) => n + e._count._all, 0),
      approvedEvents: count("APPROVED"),
      pendingEvents: count("PENDING"),
      confirmedBookings: bookings,
      revenue: { gross, ...splitAmount(gross) },
      upcoming: upcoming.map(({ _count, ...e }) => ({ ...e, bookings: _count.rsvps })),
    });
  }

  const mine = { userId: auth.id };
  const [total, confirmed, spent, upcoming] = await Promise.all([
    prisma.rSVP.count({ where: mine }),
    prisma.rSVP.count({ where: { ...mine, status: "CONFIRMED" } }),
    prisma.payment.aggregate({ where: { status: "PAID", rsvp: mine }, _sum: { amount: true } }),
    prisma.rSVP.findMany({
      where: { ...mine, status: "CONFIRMED", event: { date: { gte: now } } },
      orderBy: { event: { date: "asc" } },
      take: 5,
      select: {
        id: true,
        package: { select: { name: true } },
        event: { select: { id: true, title: true, date: true, location: true } },
      },
    }),
  ]);
  return NextResponse.json({
    role: "USER",
    totalRsvps: total,
    confirmedRsvps: confirmed,
    totalSpent: spent._sum.amount ?? 0,
    upcoming,
  });
}
