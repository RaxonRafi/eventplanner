/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";        // ⬅️ add this
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

type JwtPayload = { id: string; role: "USER" | "ADMIN" | "ORGANIZER" | string };
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

    if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);
    const q = searchParams.get("q")?.trim() || undefined;

    const sortParam = (searchParams.get("sort") ?? "date:desc") as `${SortField}:asc` | `${SortField}:desc`;
    const [sortField, sortOrder] = sortParam.split(":") as [SortField, "asc" | "desc"];

    // ✅ Make this a Prisma.EventWhereInput (and pin mode literal)
    const where: Prisma.EventWhereInput = {
      organizerId: user.id,
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
          _count: { select: { rsvps: true } },
        },
      }),
    ]);

    return NextResponse.json({
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e: any) {
    console.error("[organizer/events] GET error:", e?.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
