import { getAuth } from "@/lib/auth";
import { register } from "@/lib/realtime";
import { experimental_upgradeWebSocket } from "@vercel/functions";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Connections close at the function's max duration; the client reconnects
export const maxDuration = 300;

/** Per-user notification socket. Auth comes from the login cookie sent with the upgrade. */
export async function GET(req: Request) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    return await experimental_upgradeWebSocket(async (ws) => {
      const unregister = await register(auth.id, ws).catch((err) => {
        console.error("[ws] register failed", err?.message);
        ws.close(1011, "Realtime unavailable");
        return null;
      });
      if (!unregister) return;

      // Keep intermediaries from closing an idle connection
      const ping = setInterval(() => ws.ping(), 25_000);
      ws.on("close", () => {
        clearInterval(ping);
        unregister();
      });
      ws.send(JSON.stringify({ kind: "ready" }));
    });
  } catch {
    // Runtime without WebSocket upgrades (e.g. `next dev`) — the client falls back to polling
    return NextResponse.json({ error: "WebSockets not supported here" }, { status: 501 });
  }
}
