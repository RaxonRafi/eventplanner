"use client";

import { PageIntro } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAllRsvpQuery, useMyRsvpsQuery } from "@/redux/features/Reservation/rsvp.api";
import { useUserInfoQuery } from "@/redux/features/User/user.api";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Rsvp = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  paid: boolean;
  createdAt: string;
  user?: { name: string | null; email: string };
  event: { id: string; title: string; date: string; location: string };
  package: { name: string; price: number } | null;
};

const STATUS: Record<Rsvp["status"], { label: string; className: string }> = {
  CONFIRMED: { label: "Confirmed", className: "bg-green-500/15 text-green-700 dark:text-green-400" },
  PENDING: { label: "Awaiting payment", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  CANCELLED: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
};

const TABS: { label: string; value?: Rsvp["status"] }[] = [
  { label: "All" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Awaiting payment", value: "PENDING" },
];

function StatusBadge({ status }: { status: Rsvp["status"] }) {
  const s = STATUS[status];
  return (
    <Badge variant="outline" className={cn("border-0", s.className)}>
      {s.label}
    </Badge>
  );
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

function Pager({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="mr-2 text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
        Previous
      </Button>
      <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
        Next
      </Button>
    </div>
  );
}

/** A member's own bookings. */
function MyBookings() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useMyRsvpsQuery({ page, limit: 10 });
  const rsvps: Rsvp[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageIntro title="My bookings" description="Every event you've booked, with its payment status." />
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
      ) : isError ? (
        <p className="rounded-xl border p-10 text-center text-sm text-destructive">Failed to load bookings.</p>
      ) : rsvps.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
          <Ticket className="size-10 text-muted-foreground" />
          <p className="font-medium">No bookings yet</p>
          <p className="text-sm text-muted-foreground">Find something you&apos;ll love and book your spot.</p>
          <Button asChild className="mt-2">
            <Link href="/events">Browse events</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rsvps.map((r) => {
            const past = new Date(r.event.date) < new Date();
            return (
              <Card key={r.id} className="gap-0 py-0">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <span className="text-[11px] font-semibold uppercase">
                      {new Date(r.event.date).toLocaleString("en-US", { month: "short" })}
                    </span>
                    <span className="text-lg font-bold leading-none">{new Date(r.event.date).getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Link href={`/events/${r.event.id}`} className="font-semibold hover:underline">
                      {r.event.title}
                    </Link>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" /> {fmtDate(r.event.date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5" /> {r.event.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                    <StatusBadge status={r.status} />
                    {r.package && (
                      <span className="text-sm text-muted-foreground">
                        {r.package.name} · <span className="font-medium text-foreground">BDT {r.package.price.toLocaleString()}</span>
                      </span>
                    )}
                    {!r.paid && !past && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/events/${r.event.id}`}>Complete payment</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          <Pager page={page} totalPages={data?.meta?.totalPages ?? 1} setPage={setPage} />
        </div>
      )}
    </div>
  );
}

/** Attendee list for admins (all events) and organizers (their own events). */
function AttendeeTable({ isAdmin }: { isAdmin: boolean }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Rsvp["status"] | undefined>(undefined);
  const { data, isLoading, isFetching, isError } = useAllRsvpQuery({ page, limit: 15, status });
  const rsvps: Rsvp[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageIntro
        title={isAdmin ? "All RSVPs" : "Attendees"}
        description={isAdmin ? "Bookings across every event." : "Everyone who has booked your events."}
        actions={
          <div className="flex rounded-lg bg-muted p-1">
            {TABS.map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  setStatus(t.value);
                  setPage(1);
                }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  status === t.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />
      <Card className="gap-0 overflow-hidden py-0">
        <div className={cn("overflow-x-auto", isFetching && "opacity-60")}>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="h-11 px-4 font-medium">Attendee</th>
                <th className="h-11 px-4 font-medium">Event</th>
                <th className="h-11 px-4 font-medium">Package</th>
                <th className="h-11 px-4 text-right font-medium">Amount</th>
                <th className="h-11 px-4 font-medium">Status</th>
                <th className="h-11 px-4 font-medium">Booked</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td colSpan={6} className="p-4">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-destructive">
                    Failed to load RSVPs.
                  </td>
                </tr>
              ) : rsvps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    No RSVPs found.
                  </td>
                </tr>
              ) : (
                rsvps.map((r) => (
                  <tr key={r.id} className="border-t transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.user?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{r.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/events/${r.event.id}`} className="hover:underline">
                        {r.event.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{fmtDate(r.event.date)}</p>
                    </td>
                    <td className="px-4 py-3">{r.package?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {r.package ? `BDT ${r.package.price.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{fmtDate(r.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && !isError && (
          <p className="border-t px-4 py-3 text-xs text-muted-foreground">{data?.meta?.total ?? 0} RSVPs</p>
        )}
      </Card>
      <Pager page={page} totalPages={data?.meta?.totalPages ?? 1} setPage={setPage} />
    </div>
  );
}

export function RsvpList() {
  const { data: me, isLoading } = useUserInfoQuery(undefined);
  const role = me?.data?.role as string | undefined;

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (role === "ADMIN" || role === "ORGANIZER") return <AttendeeTable isAdmin={role === "ADMIN"} />;
  return <MyBookings />;
}
