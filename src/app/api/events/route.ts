/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuth, isAdmin, isOrganizer } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all events
export async function GET(req: Request) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const events = await prisma.event.findMany({
    include: { packages: true, rsvps: true },
  });
  return NextResponse.json(events);
}

// POST create event
export async function POST(req: Request) {
  // Allow if user is either ADMIN or ORGANIZER
  if (!isAdmin(req) && !isOrganizer(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const auth = getAuth(req);
  if (!auth?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const event = await prisma.event.create({
      data: {
        ...body,
        date: body?.date ? new Date(body.date) : undefined,
        organizer: { connect: { id: auth.id } },
      },
    });
    return NextResponse.json(event);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
