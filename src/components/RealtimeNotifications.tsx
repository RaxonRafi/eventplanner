"use client";

import { baseApi } from "@/redux/baseApi";
import { useAppDispatch } from "@/redux/hook";
import type { AppNotification } from "@/redux/features/Notification/notification.api";
import { useUserInfoQuery } from "@/redux/features/User/user.api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const POLL_MS = 30_000;
const MAX_BACKOFF_MS = 60_000;

/**
 * Keeps one WebSocket open per signed-in tab and turns pushed notifications into toasts
 * plus a refresh of the notification panel. Reconnects with backoff (Vercel closes
 * sockets at the function's max duration) and polls while disconnected, so nothing is
 * missed — including in environments without WebSocket support such as `next dev`.
 */
export function RealtimeNotifications() {
  const { data: me } = useUserInfoQuery(undefined);
  const userId: string | undefined = me?.data?.id;
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    let ws: WebSocket | null = null;
    let stopped = false;
    let retryDelay = 1_000;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;

    const refresh = () => dispatch(baseApi.util.invalidateTags(["NOTIFICATION"]));
    const startPolling = () => {
      pollTimer ??= setInterval(refresh, POLL_MS);
    };
    const stopPolling = () => {
      clearInterval(pollTimer);
      pollTimer = undefined;
    };

    const connect = () => {
      const scheme = window.location.protocol === "https:" ? "wss" : "ws";
      ws = new WebSocket(`${scheme}://${window.location.host}/api/ws`);

      ws.onopen = () => {
        retryDelay = 1_000;
        stopPolling();
        refresh(); // catch up on anything sent while disconnected
      };

      ws.onmessage = (event) => {
        let msg: { kind?: string; notification?: AppNotification };
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        if (msg.kind !== "notification" || !msg.notification) return;
        const n = msg.notification;
        toast.success(n.title, {
          description: n.body,
          action: n.link ? { label: "View", onClick: () => router.push(n.link!) } : undefined,
        });
        // Bookings and payments changed too — refresh dashboards showing them
        dispatch(baseApi.util.invalidateTags(["NOTIFICATION", "RSVP", "EVENT"]));
      };

      ws.onclose = () => {
        ws = null;
        if (stopped) return;
        startPolling();
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, MAX_BACKOFF_MS);
      };
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      stopPolling();
      ws?.close();
    };
  }, [userId, dispatch, router]);

  return null;
}
