import prisma from "@/lib/prisma";
import { Client } from "pg";
import type { WebSocket } from "ws";

/**
 * Realtime fan-out for WebSocket notifications.
 *
 * On Vercel each WebSocket is pinned to the function instance that accepted it, while
 * the code that creates a notification (payment callback, IPN) usually runs on a
 * different instance. Postgres LISTEN/NOTIFY bridges them: publishers call pg_notify,
 * and every instance holding sockets LISTENs and forwards to its own connected users.
 */

const CHANNEL = "app_notifications";

type Hub = {
  sockets: Map<string, Set<WebSocket>>; // userId -> open sockets on this instance
  listener?: Promise<Client>;
};

// Survive module re-evaluation (dev hot reload) within one instance
const g = globalThis as unknown as { __realtimeHub?: Hub };
const hub: Hub = (g.__realtimeHub ??= { sockets: new Map() });

/** Push a message to every socket a user has open on any instance. */
export async function publish(userId: string, message: unknown) {
  // pg_notify payloads are capped at 8000 bytes — notifications are a few hundred
  await prisma.$executeRaw`SELECT pg_notify(${CHANNEL}, ${JSON.stringify({ userId, message })})`;
}

function deliverLocal(userId: string, data: string) {
  for (const ws of hub.sockets.get(userId) ?? []) {
    if (ws.readyState === ws.OPEN) ws.send(data);
  }
}

function ensureListener() {
  if (hub.listener) return hub.listener;

  // LISTEN needs a dedicated session, so use the direct (non-pooled) connection
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  });
  const reset = () => {
    if (hub.listener) hub.listener = undefined;
    client.end().catch(() => {});
  };
  client.on("error", (err) => {
    console.error("[realtime] listener error", err.message);
    reset();
    // Sockets are still open — reconnect so they keep receiving
    if (hub.sockets.size > 0) ensureListener().catch(() => {});
  });
  client.on("notification", (msg) => {
    if (!msg.payload) return;
    try {
      const { userId, message } = JSON.parse(msg.payload);
      deliverLocal(userId, JSON.stringify(message));
    } catch {
      // ignore malformed payloads
    }
  });

  hub.listener = client
    .connect()
    .then(() => client.query(`LISTEN ${CHANNEL}`))
    .then(() => client)
    .catch((err) => {
      reset();
      throw err;
    });
  return hub.listener;
}

/** Track a socket for a user; returns a cleanup function to call when it closes. */
export async function register(userId: string, ws: WebSocket) {
  let set = hub.sockets.get(userId);
  if (!set) hub.sockets.set(userId, (set = new Set()));
  set.add(ws);
  await ensureListener();

  return () => {
    set!.delete(ws);
    if (set!.size === 0) hub.sockets.delete(userId);
    // Release the database session once nobody on this instance is listening,
    // so the database can scale down while the site is idle
    if (hub.sockets.size === 0 && hub.listener) {
      const listener = hub.listener;
      hub.listener = undefined;
      listener.then((c) => c.end()).catch(() => {});
    }
  };
}
