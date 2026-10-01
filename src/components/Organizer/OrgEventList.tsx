"use client";

import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { EventStatusBadge } from "@/components/dashboard/EventStatusBadge";
import { PageIntro } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { cn, eventImage } from "@/lib/utils";
import { useDeleteEventMutation, useOrgEventsQuery } from "@/redux/features/Event/event.api";
import {
  CalendarDays,
  CalendarPlus,
  ExternalLink,
  MapPin,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type OrgEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number | null;
  bannerImage: string | null;
  status: string;
  packages: { price: number }[];
  _count: { rsvps: number }; // confirmed bookings
};

const TABS = [
  { label: "All", value: undefined },
  { label: "Live", value: "APPROVED" },
  { label: "In review", value: "PENDING" },
  { label: "Rejected", value: "REJECTED" },
] as const;

const SORTS = [
  { label: "Date: latest", value: "date:desc" },
  { label: "Date: soonest", value: "date:asc" },
  { label: "Recently created", value: "createdAt:desc" },
  { label: "Title A–Z", value: "title:asc" },
];

export function OrgEventList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState("date:desc");
  const [search, setSearch] = useState("");
  const q = useDebounce(search.trim(), 400);

  // Any filter change goes back to the first page
  useEffect(() => setPage(1), [q, status, sort]);

  const { data, isLoading, isFetching, isError } = useOrgEventsQuery({
    page,
    take: 9,
    q: q || undefined,
    sort,
    status,
  });
  const [deleteEvent] = useDeleteEventMutation();
  const [toDelete, setToDelete] = useState<OrgEvent | null>(null);

  const events: OrgEvent[] = data?.data ?? [];
  const totalPages: number = data?.meta?.totalPages ?? 1;

  const handleDelete = async (evt: OrgEvent) => {
    const id = toast.loading("Deleting event…");
    try {
      await deleteEvent(evt.id).unwrap();
      toast.success(`"${evt.title}" deleted`, { id });
    } catch (err) {
      const e = err as { data?: { error?: string } };
      toast.error(e?.data?.error || "Couldn't delete the event", { id });
    }
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="My events"
        description="Create, edit and track the events you organize."
        actions={
          <Button asChild>
            <Link href="/dashboard/events/create">
              <CalendarPlus className="size-4" /> Create event
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your events…"
            className="pl-9"
            aria-label="Search events"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-muted p-1">
            {TABS.map((t) => (
              <button
                key={t.label}
                onClick={() => setStatus(t.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  status === t.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 text-sm"
            aria-label="Sort events"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-xl border p-10 text-center text-sm text-destructive">Failed to load events.</p>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
          <CalendarPlus className="size-10 text-muted-foreground" />
          <p className="font-medium">{q || status ? "No events match your filters" : "No events yet"}</p>
          <p className="text-sm text-muted-foreground">
            {q || status ? "Try another search or tab." : "Create your first event to start selling tickets."}
          </p>
          {!q && !status && (
            <Button asChild className="mt-2">
              <Link href="/dashboard/events/create">Create event</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className={cn("grid gap-5 sm:grid-cols-2 xl:grid-cols-3", isFetching && "opacity-60")}>
          {events.map((evt) => {
            const date = new Date(evt.date);
            const past = date < new Date();
            const booked = evt._count.rsvps;
            const fill = evt.capacity ? Math.min(100, (booked / evt.capacity) * 100) : 0;
            const from = evt.packages.length ? Math.min(...evt.packages.map((p) => p.price)) : null;
            return (
              <div
                key={evt.id}
                className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[16/9] bg-muted">
                  <Image
                    src={eventImage(evt)}
                    alt={evt.title}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={cn("object-cover", past && "grayscale-[50%]")}
                  />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    <EventStatusBadge status={evt.status} className="bg-background/90 backdrop-blur" />
                    {past && (
                      <span className="rounded-md bg-background/90 px-2 py-0.5 text-xs font-medium backdrop-blur">
                        Ended
                      </span>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute right-3 top-3 size-8 bg-background/90 backdrop-blur"
                        aria-label="Event actions"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/events/${evt.id}/edit`}>
                          <Pencil /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/events/${evt.id}`}>
                          <ExternalLink /> View public page
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(evt)}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <h3 className="line-clamp-1 font-semibold">{evt.title}</h3>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="size-4 shrink-0" />
                      {date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </p>
                  </div>

                  <div className="mt-auto space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {booked} {evt.capacity ? `/ ${evt.capacity}` : ""} booked
                      </span>
                      {from != null && <span className="font-medium">From BDT {from.toLocaleString()}</span>}
                    </div>
                    {evt.capacity ? (
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${fill}%` }} />
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/events/${evt.id}/edit`}>
                        <Pencil className="size-3.5" /> Edit
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/events/${evt.id}`}>
                        <ExternalLink className="size-3.5" /> View
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeleteConfirmation
        open={toDelete != null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete "${toDelete?.title}"?`}
        description={
          toDelete && toDelete._count.rsvps > 0
            ? "This event has bookings. Events with paid bookings can't be deleted."
            : "The event and its ticket packages will be permanently removed."
        }
        onConfirm={() => toDelete && handleDelete(toDelete)}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="mr-2 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button size="sm" variant="outline" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
