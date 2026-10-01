/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10))
    );
    const q = searchParams.get("q")?.trim() || undefined;
    // sort: latest (newest first, default) | soonest (date asc) | date_desc
    const sort = searchParams.get("sort") ?? "latest";
    // when: all (default) | upcoming | past
    const when = searchParams.get("when") ?? "all";
    const now = new Date();
    const orderBy =
      sort === "soonest"
        ? [{ date: "asc" as const }]
        : sort === "date_desc"
          ? [{ date: "desc" as const }]
          : [{ createdAt: "desc" as const }, { date: "desc" as const }];

    const where: any = {
      status: EventStatus.APPROVED,
      ...(when === "upcoming" ? { date: { gte: now } } : {}),
      ...(when === "past" ? { date: { lt: now } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          location: true,
          bannerImage: true,
          capacity: true,
          packages: { select: { price: true }, orderBy: { price: "asc" }, take: 1 },
        },
      }),
    ]);

    return NextResponse.json({
      data: items.map(({ packages, ...e }) => ({
        ...e,
        minPrice: packages[0]?.price ?? null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load events" },
      { status: 500 }
    );
  }
}
