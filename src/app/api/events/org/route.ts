/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EventStatus, Prisma, RSVPStatus, Role } from "@prisma/client";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

type JwtPayload = { id: string; role: Role };
type SortField = "title" | "date" | "createdAt" | "location";

export async function GET(req: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let user: JwtPayload;
    try {
      user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (user.role !== Role.ORGANIZER && user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10) || 12));
    const q = searchParams.get("q")?.trim() || undefined;
    const statusParam = searchParams.get("status");
    const status = (Object.values(EventStatus) as string[]).includes(statusParam ?? "")
      ? (statusParam as EventStatus)
      : undefined;

    // Only allow known sort fields — anything else falls back to the default
    const SORT_FIELDS: SortField[] = ["title", "date", "createdAt", "location"];
    const [rawField, rawOrder] = (searchParams.get("sort") ?? "date:desc").split(":");
    const sortField: SortField = SORT_FIELDS.includes(rawField as SortField) ? (rawField as SortField) : "date";
    const sortOrder = rawOrder === "asc" ? "asc" : "desc";

    const where: Prisma.EventWhereInput = {
      organizerId: user.id,
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
              { location: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.EventOrderByWithRelationInput =
      { [sortField]: sortOrder } as Prisma.EventOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          packages: true,
          _count: { select: { rsvps: { where: { status: RSVPStatus.CONFIRMED } } } },
        },
      }),
    ]);

    return NextResponse.json({
      data: items,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (e: any) {
    console.error("[organizer/events] GET error:", e?.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
