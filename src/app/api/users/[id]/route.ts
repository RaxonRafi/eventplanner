/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Role } from "@prisma/client"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key"

export async function DELETE(req: Request) {
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

  // Only admin can delete users
  if (decoded.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 })
  }

const { pathname } = new URL(req.url);
const userId = pathname.split("/").pop();

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  try {
    await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json({ message: "User deleted" })
  } catch (err: any) {
    return NextResponse.json({ message: "User not found or delete failed",error:err }, { status: 400 },)
  }
}