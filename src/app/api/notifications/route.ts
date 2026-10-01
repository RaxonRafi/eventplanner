import { getAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

/** The signed-in user's notifications, newest first, plus the unread count. */
export async function GET(req: Request) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));

  const [data, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({ where: { userId: auth.id, read: false } }),
  ]);
  return NextResponse.json({ data, unread });
}

const MarkSchema = z.union([
  z.object({ all: z.literal(true) }),
  z.object({ ids: z.array(z.string().min(1)).min(1).max(100) }),
]);

/** Mark some (`{ ids }`) or all (`{ all: true }`) of the user's notifications as read. */
export async function PATCH(req: Request) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = MarkSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { count } = await prisma.notification.updateMany({
    where: {
      userId: auth.id,
      read: false,
      ...("ids" in parsed.data ? { id: { in: parsed.data.ids } } : {}),
    },
    data: { read: true },
  });
  return NextResponse.json({ updated: count });
}
