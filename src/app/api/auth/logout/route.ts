/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    (await cookies()).set("token", "", {
      httpOnly: true,
      secure: false,
      sameSite:"lax",
      path: "/",
      expires: new Date(0),
    });

    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
