import { EventStatus } from "@prisma/client";
import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "Event ID required" }, { status: 400 });

  const body = await req.json();
  const status = body.status as EventStatus;

  if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const event = await prisma.event.update({
      where: { id },
      data: { status },
      include: {
        packages: true,
        organizer: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json(event);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
