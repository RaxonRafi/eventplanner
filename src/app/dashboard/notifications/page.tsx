"use client";

import { NotificationItem, useOpenNotification } from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkNotificationsReadMutation,
  useNotificationsQuery,
} from "@/redux/features/Notification/notification.api";
import { Bell, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const { data, isLoading } = useNotificationsQuery({ limit: 50 });
  const [markRead, { isLoading: marking }] = useMarkNotificationsReadMutation();
  const open = useOpenNotification();
  const items = data?.data ?? [];
  const unread = data?.unread ?? 0;

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-lg font-semibold">Notifications</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex max-w-3xl items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread` : "You're all caught up"}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={unread === 0 || marking}
            onClick={() => markRead({ all: true })}
          >
            <CheckCheck className="size-4" /> Mark all as read
          </Button>
        </div>
        <Card className="max-w-3xl py-2">
          <CardContent className="space-y-1 px-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                <Bell className="size-10 opacity-40" />
                <p>No notifications yet.</p>
                <p className="text-sm">Booking and payment updates will show up here.</p>
              </div>
            ) : (
              items.map((n) => <NotificationItem key={n.id} n={n} onOpen={open} />)
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}
