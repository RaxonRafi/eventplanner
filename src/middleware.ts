import { NextResponse, type NextRequest } from "next/server";

function base64UrlDecode(input: string): string {
  // Replace URL-safe chars and pad
  const pad = input.length % 4 === 2 ? "==" : input.length % 4 === 3 ? "=" : "";
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  // atob is available in the Edge runtime
  return atob(b64);
}

function getRoleFromJwt(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);
    return payload?.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Role-based access control for subpaths
    const role = getRoleFromJwt(token);
    const isAdmin = role === "ADMIN";
    const isOrganizer = role === "ORGANIZER";

    // Admin-only areas
    if (pathname.startsWith("/dashboard/users") && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Organizer and Admin allowed for events/payments management
    if (
      (pathname.startsWith("/dashboard/events") ||
        pathname.startsWith("/dashboard/payments")) &&
      !(isAdmin || isOrganizer)
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Note: /dashboard/rsvps is allowed for all logged-in users
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
