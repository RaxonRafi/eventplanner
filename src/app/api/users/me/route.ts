/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
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

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: USER_SELECT,
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({data:user})
}