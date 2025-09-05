/* eslint-disable @typescript-eslint/no-explicit-any */
import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH update event
export async function PATCH(req: Request) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();;
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
export async function DELETE(req: Request) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();;
  if (!id)
    return NextResponse.json({ error: "Event ID required" }, { status: 400 });
  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ message: "Event deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
