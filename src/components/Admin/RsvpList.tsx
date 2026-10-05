"use client";

import {
  FilterPill,
  TableCard,
  TableMessage,
  TableSearch,
  TableSkeletonRows,
  TableToolbar,
} from "@/components/dashboard/DataTable";
import { PageIntro } from "@/components/dashboard/PageHeader";
import { StatusPill, type StatusTone } from "@/components/dashboard/StatusPill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { oneOf, usePageParams, useQueryParams, useSearchParam } from "@/hooks/use-query-params";
import { useAllRsvpQuery, useMyRsvpsQuery } from "@/redux/features/Reservation/rsvp.api";
import { useUserInfoQuery } from "@/redux/features/User/user.api";
import { CalendarDays, CircleCheck, CircleX, Clock, ListFilter, type LucideIcon, MapPin, Ticket } from "lucide-react";
import Link from "next/link";

type Rsvp = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  paid: boolean;
  createdAt: string;
  user?: { name: string | null; email: string };
  event: { id: string; title: string; date: string; location: string };
  package: { name: string; price: number } | null;
};

const STATUS: Record<Rsvp["status"], { label: string; tone: StatusTone; icon: LucideIcon }> = {
  CONFIRMED: { label: "Confirmed", tone: "green", icon: CircleCheck },
  PENDING: { label: "Awaiting payment", tone: "amber", icon: Clock },
  CANCELLED: { label: "Cancelled", tone: "muted", icon: CircleX },
};

const STATUSES: { label: string; value?: Rsvp["status"] }[] = [
  { label: "All statuses" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Awaiting payment", value: "PENDING" },
];

function StatusBadge({ status }: { status: Rsvp["status"] }) {
  const s = STATUS[status];
  return (
    <StatusPill tone={s.tone} icon={s.icon}>
      {s.label}
    </StatusPill>
  );
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/** A member's own bookings. */
function MyBookings() {
  const { page, pageSize } = usePageParams();
  const { data, isLoading, isError } = useMyRsvpsQuery({ page, limit: pageSize });
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
          <Pagination
            page={page}
            pageSize={pageSize}
            total={data?.meta?.total ?? 0}
            pageSizes={[]}
            className="sm:justify-end"
          />
        </div>
      )}
    </div>
  );
}

/** Attendee list for admins (all events) and organizers (their own events). */
function AttendeeTable({ isAdmin }: { isAdmin: boolean }) {
  const { searchParams, setParams } = useQueryParams();
  const { page, pageSize } = usePageParams();
  const { q, input, setInput } = useSearchParam();
  const status = oneOf(searchParams.get("status"), STATUSES.map((s) => s.value));
  const { data, isLoading, isFetching, isError } = useAllRsvpQuery({
    page,
    limit: pageSize,
    status,
    q: q || undefined,
  });
  const rsvps: Rsvp[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageIntro
        title={isAdmin ? "All RSVPs" : "Attendees"}
        description={isAdmin ? "Bookings across every event." : "Everyone who has booked your events."}
      />
      <TableCard
        fetching={isFetching}
        toolbar={
          <TableToolbar
            search={
              <TableSearch
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search attendee or event…"
                aria-label="Search RSVPs"
              />
            }
          >
            <FilterPill
              label="Filter by status"
              icon={ListFilter}
              options={STATUSES}
              value={status}
              onChange={(v) => setParams({ status: v })}
            />
          </TableToolbar>
        }
        footer={
          !isLoading &&
          !isError && (
            <Pagination page={page} pageSize={pageSize} total={data?.meta?.total ?? 0} noun="RSVPs" />
          )
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Attendee</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Package</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Booked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows cols={6} />
            ) : isError ? (
              <TableMessage colSpan={6} error>
                Failed to load RSVPs.
              </TableMessage>
            ) : rsvps.length === 0 ? (
              <TableMessage colSpan={6}>No RSVPs found.</TableMessage>
            ) : (
              rsvps.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-semibold">{r.user?.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{r.user?.email}</p>
                  </TableCell>
                  <TableCell>
                    <Link href={`/events/${r.event.id}`} className="font-medium hover:underline">
                      {r.event.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{fmtDate(r.event.date)}</p>
                  </TableCell>
                  <TableCell>{r.package?.name ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.package ? `BDT ${r.package.price.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{fmtDate(r.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableCard>
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
