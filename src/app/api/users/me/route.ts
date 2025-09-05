/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { createUserSchema } from "@/lib/validators/users.validation"
import bcrypt from "bcryptjs"

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

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: USER_SELECT,
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({data:user})
}
export async function PATCH(req: Request) {
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

  const body = await req.json()
  let userId = decoded.id

  // If admin, allow updating any user by id
  const isAdmin = decoded.role === "ADMIN"
  if (isAdmin && body.id) {
    userId = body.id
  }

  // Validate input (partial schema for updates)
  const updateData = createUserSchema.partial().parse(body)

  delete updateData.role
  delete updateData.email

  // Hash password if present
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10)
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: USER_SELECT,
    })
    return NextResponse.json({ data: updated })
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Update failed" }, { status: 400 })
  }
}