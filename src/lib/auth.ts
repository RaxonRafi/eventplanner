import { Role, User } from "@prisma/client";
import jwt from "jsonwebtoken";
import prisma from "./prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

export type JwtPayload = {
  id: string; // user id
  role: Role; // "ADMIN" | "ORGANIZER" | "USER"
  // add other claims if you include them
};

function getTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];
  return token || null;
}

export function getAuth(req: Request): JwtPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function isAdmin(req: Request): boolean {
  const user = getAuth(req);
  return user?.role === Role.ADMIN;
}

export function isOrganizer(req: Request): boolean {
  const user = getAuth(req);
  return user?.role === Role.ORGANIZER;
}

export function isUser(req: Request): boolean {
  const user = getAuth(req);
  return user?.role === Role.USER;
}

/** If you need the DB user record */
export async function getUserFromRequest(req: Request): Promise<User | null> {
  const auth = getAuth(req);
  if (!auth?.id) return null;
  try {
    return await prisma.user.findUnique({ where: { id: auth.id } });
  } catch {
    return null;
  }
}
