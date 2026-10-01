import { getAuth, isAdmin, isOrganizer } from "@/lib/auth";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Serverless hosts (Vercel) have a read-only, non-persistent filesystem, so banners go to Cloudinary.
async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET)
    throw new Error("Image storage is not configured");

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "eventers/events";
  // Signature = sha1 of the signed params (alphabetical) + api secret
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${API_SECRET}`)
    .digest("hex");

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", API_KEY);
  body.append("timestamp", timestamp);
  body.append("folder", folder);
  body.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body,
  });
  const data = await res.json();
  if (!res.ok || !data.secure_url)
    throw new Error(data?.error?.message || "Upload failed");
  return data.secure_url as string;
}

export async function POST(req: Request) {
  if (!isAdmin(req) && !isOrganizer(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const auth = getAuth(req);
  if (!auth?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    const url = await uploadToCloudinary(file);
    return NextResponse.json({ url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
