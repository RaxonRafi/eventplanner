/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";
export function isAdmin(req: Request) {
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";
  const token = req.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("token="))
    ?.split("=")[1];
  if (!token) return false;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.role === "ADMIN";
  } catch {
    return false;
  }
}
export function isOranizer(req: Request) {
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";
  const token = req.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("token="))
    ?.split("=")[1];
  if (!token) return false;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.role === Role.ORGANIZER;
  } catch {
    return false;
  }
}