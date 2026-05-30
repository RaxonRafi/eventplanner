import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [totalUsers, totalEvents, pendingEvents, approvedEvents, rejectedEvents, totalRsvps] =
    await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.event.count({ where: { status: "PENDING" } }),
      prisma.event.count({ where: { status: "APPROVED" } }),
      prisma.event.count({ where: { status: "REJECTED" } }),
      prisma.rSVP.count(),
    ]);

  return NextResponse.json({
    totalUsers,
    totalEvents,
    pendingEvents,
    approvedEvents,
    rejectedEvents,
    totalRsvps,
  });
}
