"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  type AppNotification,
  useMarkNotificationsReadMutation,
  useNotificationsQuery,
} from "@/redux/features/Notification/notification.api";
import { Bell, CircleCheck, Landmark, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ICONS: Record<AppNotification["type"], typeof Bell> = {
  BOOKING_CONFIRMED: CircleCheck,
  NEW_BOOKING: Ticket,
  PAYMENT_RECEIVED: Landmark,
};

export function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function NotificationItem({
  n,
  onOpen,
}: {
  n: AppNotification;
  onOpen: (n: AppNotification) => void;
}) {
  const Icon = ICONS[n.type] ?? Bell;
  return (
    <button
      onClick={() => onOpen(n)}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted",
        !n.read && "bg-primary/5"
      )}
    >
      <span className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{n.title}</span>
          <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
        </span>
        <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>
      </span>
      {!n.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
    </button>
  );
}

export function useOpenNotification() {
  const router = useRouter();
  const [markRead] = useMarkNotificationsReadMutation();
  return (n: AppNotification) => {
    if (!n.read) markRead({ ids: [n.id] });
    if (n.link) router.push(n.link);
  };
}

export function NotificationBell({ className }: { className?: string }) {
  const { data } = useNotificationsQuery({ limit: 8 });
  const [markRead] = useMarkNotificationsReadMutation();
  const open = useOpenNotification();
  const items = data?.data ?? [];
  const unread = data?.unread ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("relative", className)}
          aria-label={unread ? `Notifications (${unread} unread)` : "Notifications"}
        >
          <Bell className="size-[1.2rem]" />
          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-semibold">Notifications</p>
          {unread > 0 && (
            <button
              onClick={() => markRead({ all: true })}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto p-1.5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
              <Bell className="size-8 opacity-40" />
              You&apos;re all caught up
            </div>
          ) : (
            items.map((n) => <NotificationItem key={n.id} n={n} onOpen={open} />)
          )}
        </div>
        <Link
          href="/dashboard/notifications"
          className="block border-t px-4 py-2.5 text-center text-sm font-medium hover:bg-muted"
        >
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
