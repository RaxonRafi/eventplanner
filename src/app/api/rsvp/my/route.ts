/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { RSVPStatus } from "@prisma/client"

if (!process.env.NEXTAUTH_SECRET) throw new Error("NEXTAUTH_SECRET is not set")
const JWT_SECRET = process.env.NEXTAUTH_SECRET

type JwtPayload = { id: string; role: "USER" | "ADMIN" | "ORGANIZER" | string }

export async function GET(req: Request) {
  // --- Auth (any logged-in user) ---
  const token = (await cookies()).get("token")?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let user: JwtPayload
  try {
    user = jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  // --- Query params: ?status=&eventId=&page=&limit= ---
  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get("eventId") ?? undefined
  const statusParam = searchParams.get("status") ?? undefined
  const pageParam = searchParams.get("page") ?? "1"
  const limitParam = searchParams.get("limit") ?? "20"

  let status: RSVPStatus | undefined
  if (statusParam) {
    const ok = (Object.values(RSVPStatus) as string[]).includes(statusParam)
    if (!ok) return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    status = statusParam as RSVPStatus
  }

  const page = Math.max(1, parseInt(pageParam, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(limitParam, 10) || 20))
  const skip = (page - 1) * limit

  const where = {
    userId: user.id,               // <-- only this user's RSVPs
    ...(eventId ? { eventId } : {}),
    ...(status ? { status } : {}),
  }

  try {
    const [total, data] = await Promise.all([
      prisma.rSVP.count({ where }),
      prisma.rSVP.findMany({
        where,
        include: {
          event:   { select: { id: true, title: true, date: true, location: true } },
          package: { select: { id: true, name: true, price: true } },
          Payment: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / limit))
    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    })
  } catch (e: any) {
    console.error("[GET My RSVPs]", e?.message)
    return NextResponse.json({ error: "Failed to fetch RSVPs" }, { status: 500 })
  }
}
