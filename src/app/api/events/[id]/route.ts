/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventStatus } from "@prisma/client";
import { getAuth, isAdmin } from "@/lib/auth";
import { EventInput, firstIssue } from "@/lib/validators/event.validation";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET event by id (public for approved; organizer/admin can view any)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "Event ID required" }, { status: 400 });
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        packages: true,
        organizer: { select: { id: true, name: true } },
        _count: { select: { rsvps: { where: { status: "CONFIRMED" } } } },
      },
    });
    if (!event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const auth = getAuth(_req);
    const isOwner = auth?.id === event.organizerId;
    const canView =
      event.status === EventStatus.APPROVED || isAdmin(_req) || isOwner;

    if (!canView)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    return NextResponse.json(event);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// PATCH edit event — the organizer who owns it, or an admin
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const parsed = EventInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  const { packages, ...fields } = parsed.data;

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      organizerId: true,
      status: true,
      date: true,
      packages: { select: { id: true, name: true, _count: { select: { rsvps: true } } } },
      _count: { select: { rsvps: { where: { status: "CONFIRMED" } } } },
    },
  });
  const admin = auth.role === "ADMIN";
  if (!event || (!admin && event.organizerId !== auth.id))
    return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Business rules
  if (fields.date.getTime() !== event.date.getTime() && fields.date < new Date())
    return NextResponse.json({ error: "Event date must be in the future" }, { status: 400 });
  const sold = event._count.rsvps;
  if (fields.capacity != null && fields.capacity < sold)
    return NextResponse.json(
      { error: `Capacity can't be lower than the ${sold} seats already booked` },
      { status: 400 }
    );

  const existingIds = new Set(event.packages.map((p) => p.id));
  const foreign = packages.find((p) => p.id && !existingIds.has(p.id));
  if (foreign)
    return NextResponse.json({ error: "Package does not belong to this event" }, { status: 400 });
  const keptIds = new Set(packages.flatMap((p) => (p.id ? [p.id] : [])));
  const removed = event.packages.filter((p) => !keptIds.has(p.id));
  const locked = removed.find((p) => p._count.rsvps > 0);
  if (locked)
    return NextResponse.json(
      { error: `"${locked.name}" already has bookings and can't be removed` },
      { status: 400 }
    );

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (removed.length)
        await tx.eventPackage.deleteMany({ where: { id: { in: removed.map((p) => p.id) } } });
      for (const p of packages) {
        if (p.id)
          await tx.eventPackage.update({ where: { id: p.id }, data: { name: p.name, price: p.price } });
        else await tx.eventPackage.create({ data: { name: p.name, price: p.price, eventId: id } });
      }
      return tx.event.update({
        where: { id },
        data: {
          ...fields,
          bannerImage: fields.bannerImage || null,
          capacity: fields.capacity ?? null,
          // A rejected event goes back into the review queue once the organizer fixes it
          ...(!admin && event.status === EventStatus.REJECTED ? { status: EventStatus.PENDING } : {}),
        },
        include: { packages: true },
      });
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("[PATCH event]", err?.message);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE event — owner or admin; refused once anyone has paid
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    select: { organizerId: true, _count: { select: { rsvps: { where: { paid: true } } } } },
  });
  if (!event || (auth.role !== "ADMIN" && event.organizerId !== auth.id))
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event._count.rsvps > 0)
    return NextResponse.json(
      { error: `This event has ${event._count.rsvps} paid booking(s) and can't be deleted. Reject it instead.` },
      { status: 409 }
    );

  try {
    // Packages and RSVPs reference the event without cascades, so remove them first
    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { rsvp: { eventId: id } } }),
      prisma.rSVP.deleteMany({ where: { eventId: id } }),
      prisma.eventPackage.deleteMany({ where: { eventId: id } }),
      prisma.event.delete({ where: { id } }),
    ]);
    return NextResponse.json({ message: "Event deleted" });
  } catch (err: any) {
    console.error("[DELETE event]", err?.message);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
