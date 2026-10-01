/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventStatus, RSVPStatus } from "@prisma/client";
import { getAuth, isAdmin, isOrganizer } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { EventInput, firstIssue } from "@/lib/validators/event.validation";

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
      _count: { select: { rsvps: { where: { status: RSVPStatus.CONFIRMED } } } },
      organizer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(events);
}

// POST create event (organizer or admin)
export async function POST(req: Request) {
  if (!isAdmin(req) && !isOrganizer(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const auth = getAuth(req);
  if (!auth?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = EventInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  const { packages, ...fields } = parsed.data;
  if (fields.date < new Date())
    return NextResponse.json({ error: "Event date must be in the future" }, { status: 400 });

  try {
    const event = await prisma.event.create({
      data: {
        ...fields,
        bannerImage: fields.bannerImage || null,
        capacity: fields.capacity ?? null,
        status: isAdmin(req) ? EventStatus.APPROVED : EventStatus.PENDING,
        organizer: { connect: { id: auth.id } },
        // Only plain creates — never pass client objects straight into a nested write
        packages: { create: packages.map(({ name, price }) => ({ name, price })) },
      },
      include: { packages: true },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (err: any) {
    console.error("[POST events]", err?.message);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
