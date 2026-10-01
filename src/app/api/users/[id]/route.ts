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

  if (userId === decoded.id) {
    return NextResponse.json({ error: "You can't delete your own account" }, { status: 400 })
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      _count: {
        select: {
          events: true,
          rsvps: { where: { paid: true } },
        },
      },
    },
  })
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })
  // Deleting cascades to RSVPs and payments — never silently erase financial records
  if (target._count.events > 0) {
    return NextResponse.json(
      { error: `This user organizes ${target._count.events} event(s). Delete or reassign them first.` },
      { status: 409 }
    )
  }
  if (target._count.rsvps > 0) {
    return NextResponse.json(
      { error: `This user has ${target._count.rsvps} paid booking(s) and can't be deleted.` },
      { status: 409 }
    )
  }

  try {
    await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json({ message: "User deleted" })
  } catch (err: any) {
    console.error("[DELETE user]", err?.message)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}