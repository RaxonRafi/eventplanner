/* eslint-disable @typescript-eslint/no-explicit-any */
import { isAdmin, isOranizer } from "@/lib/auth";
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
  if (!isAdmin(req) || !isOranizer(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  try {
    const event = await prisma.event.create({ data: body });
    return NextResponse.json(event);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}


