/* eslint-disable @typescript-eslint/no-explicit-any */
import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET event by id (public)
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
        _count: { select: { rsvps: true } },
      },
    });
    if (!event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json(event);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// PATCH update event
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { id } = await params;
  const { data } = body;
  if (!id)
    return NextResponse.json({ error: "Event ID required" }, { status: 400 });
  try {
    const event = await prisma.event.update({ where: { id }, data });
    return NextResponse.json(event);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
// DELETE event
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "Event ID required" }, { status: 400 });
  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ message: "Event deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
