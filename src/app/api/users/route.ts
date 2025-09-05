/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { createUserSchema } from "@/lib/validators/users.validation"
import { Prisma, Role } from "@prisma/client"
import jwt from "jsonwebtoken"

const USER_SELECT = {
  id: true, name: true, email: true, image: true, role: true, createdAt: true,
} as const
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key"

export async function GET(req: Request) {
  // Get token from cookies
  const token = req.headers.get("cookie")?.split(";").find(c => c.trim().startsWith("token="))?.split("=")[1]
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let decoded: any
  try {
    decoded = jwt.verify(token, JWT_SECRET)
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  if (decoded.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  const page = Number(searchParams.get("page") ?? 1)
  const take = Number(searchParams.get("take") ?? 20)
  const skip = (page - 1) * take

  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {}

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: USER_SELECT,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    data,
    total,
    page,
    take,
    totalPages: Math.ceil(total / take),
  })
}
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const data = createUserSchema.parse(body)

    const hashed = data.password ? await bcrypt.hash(data.password, 10) : undefined

    const created = await prisma.user.create({
      data: { ...data, password: hashed },
      select: USER_SELECT,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
  
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    if (err?.issues) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
