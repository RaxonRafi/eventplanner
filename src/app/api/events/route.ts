/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventStatus } from "@prisma/client";
import { getAuth, isAdmin, isOrganizer } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all events (admin)
export async function GET(req: Request) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as EventStatus | null;

  const where = status ? { status } : {};

  const events = await prisma.event.findMany({
    where,
    include: {
      packages: true,
      rsvps: true,
      organizer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(events);
}

// POST create event
export async function POST(req: Request) {
  if (!isAdmin(req) && !isOrganizer(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const auth = getAuth(req);
  if (!auth?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status: EventStatus = isAdmin(req) ? EventStatus.APPROVED : EventStatus.PENDING;

  try {
    const { title, description, date, location, capacity, bannerImage, packages } = body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        capacity,
        bannerImage: bannerImage || null,
        status,
        organizer: { connect: { id: auth.id } },
        packages,
      },
      include: { packages: true },
    });
    return NextResponse.json(event);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
