/* eslint-disable @typescript-eslint/no-explicit-any */
import { isAdmin, isOrganizer } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET all event packages
export async function GET(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const packages = await prisma.eventPackage.findMany({
    include: { event: true, rsvps: true },
  });

  return NextResponse.json(packages);
}

// POST create event package
export async function POST(req: NextRequest) {
  // Allow if user is either ADMIN or ORGANIZER
  if (!isAdmin(req) && !isOrganizer(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  try {
    const eventPackage = await prisma.eventPackage.create({ data: body });
    return NextResponse.json(eventPackage);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// PATCH update event package
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, ...data } = body;
  if (!id)
    return NextResponse.json({ error: "Package ID required" }, { status: 400 });

  try {
    const eventPackage = await prisma.eventPackage.update({
      where: { id },
      data,
    });
    return NextResponse.json(eventPackage);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE event package
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id } = body;
  if (!id)
    return NextResponse.json({ error: "Package ID required" }, { status: 400 });

  try {
    await prisma.eventPackage.delete({ where: { id } });
    return NextResponse.json({ message: "Event package deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
