"use client";

import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT, PLATFORM_FEE_RATE } from "@/lib/fees";
import { useDashboardStatsQuery } from "@/redux/features/Payment/payment.api";
import { useUserInfoQuery } from "@/redux/features/User/user.api";
import { PageIntro } from "@/components/dashboard/PageHeader";
import { EventStatusBadge } from "@/components/dashboard/EventStatusBadge";
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Landmark,
  Plus,
  Ticket,
  Wallet,
} from "lucide-react";
import Link from "next/link";

type UpcomingEvent = {
  id: string;
  title: string;
  date: string;
  status: string;
  capacity: number | null;
  bookings: number;
};
type UpcomingRsvp = {
  id: string;
  package: { name: string } | null;
  event: { id: string; title: string; date: string; location: string };
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function DashboardOverview() {
  const { data, isLoading, isError } = useDashboardStatsQuery(undefined);
  const { data: me } = useUserInfoQuery(undefined);
  const firstName = (me?.data?.name as string | undefined)?.split(" ")[0];
  const greeting = (
    <PageIntro
      title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
      description={
        data?.role === "USER"
          ? "Here's what's coming up for you."
          : "Here's how your events are doing."
      }
    />
  );

  if (isError)
    return <p className="p-4 text-sm text-muted-foreground">Failed to load your dashboard.</p>;

  if (data?.role === "USER") {
    const upcoming: UpcomingRsvp[] = data.upcoming;
    return (
      <div className="flex flex-col gap-6">
        {greeting}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="My RSVPs" value={data.totalRsvps} icon={Ticket} />
          <StatCard label="Confirmed" value={data.confirmedRsvps} icon={CalendarCheck} />
          <StatCard label="Total spent" value={formatBDT(data.totalSpent)} icon={Wallet} />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming events</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/events">Explore events</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No upcoming bookings yet.
              </p>
            ) : (
              upcoming.map((r) => (
                <Link
                  key={r.id}
                  href={`/events/${r.event.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(r.event.date)} · {r.event.location}
                    </p>
                  </div>
                  {r.package && <Badge variant="secondary">{r.package.name}</Badge>}
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcoming: UpcomingEvent[] = data?.upcoming ?? [];
  return (
    <div className="flex flex-col gap-6">
      {greeting}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="My events"
          value={data?.totalEvents ?? 0}
          hint={`${data?.approvedEvents ?? 0} live · ${data?.pendingEvents ?? 0} pending review`}
          icon={CalendarDays}
          loading={isLoading}
        />
        <StatCard
          label="Confirmed bookings"
          value={data?.confirmedBookings ?? 0}
          icon={Ticket}
          loading={isLoading}
        />
        <StatCard
          label="Your earnings"
          value={formatBDT(data?.revenue?.organizerAmount ?? 0)}
          hint={`From ${formatBDT(data?.revenue?.gross ?? 0)} in sales`}
          icon={Wallet}
          className="text-green-600 dark:text-green-400"
          loading={isLoading}
        />
        <StatCard
          label="Platform fee"
          value={formatBDT(data?.revenue?.platformFee ?? 0)}
          hint={`${PLATFORM_FEE_RATE * 100}% of every booking`}
          icon={Landmark}
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming events</CardTitle>
          <Button asChild size="sm">
            <Link href="/dashboard/events/create">
              <Plus className="size-4" /> Create event
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No upcoming events. Create one to start selling tickets.
            </p>
          ) : (
            upcoming.map((e) => {
              const fill = e.capacity ? Math.min(100, (e.bookings / e.capacity) * 100) : 0;
              return (
                <Link
                  key={e.id}
                  href={`/events/${e.id}`}
                  className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{e.title}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" /> {fmtDate(e.date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {e.bookings}
                        {e.capacity ? ` / ${e.capacity}` : ""} booked
                      </span>
                      <EventStatusBadge status={e.status} />
                    </div>
                  </div>
                  {e.capacity ? (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${fill}%` }} />
                    </div>
                  ) : null}
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
