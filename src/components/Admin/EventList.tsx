"use client";

import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { EventStatusBadge } from "@/components/dashboard/EventStatusBadge";
import { PageIntro } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, eventImage } from "@/lib/utils";
import {
  type EventStatus,
  useAllEventsQuery,
  useDeleteEventMutation,
  useUpdateEventStatusMutation,
} from "@/redux/features/Event/event.api";
import { CheckCircle2, ExternalLink, MoreHorizontal, Pencil, Search, Trash2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type AdminEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number | null;
  bannerImage: string | null;
  status: EventStatus;
  organizer: { name: string | null; email: string } | null;
  _count: { rsvps: number }; // confirmed bookings
};

const TABS: { label: string; value?: EventStatus }[] = [
  { label: "All" },
  { label: "In review", value: "PENDING" },
  { label: "Live", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export function EventList() {
  const [status, setStatus] = useState<EventStatus | undefined>(undefined);
  const [search, setSearch] = useState("");
  const { data, isLoading, isFetching, isError } = useAllEventsQuery({ status });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateEventStatusMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const events: AdminEvent[] = useMemo(() => {
    const all: AdminEvent[] = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((e) =>
      [e.title, e.location, e.organizer?.name, e.organizer?.email].some((v) => v?.toLowerCase().includes(q))
    );
  }, [data, search]);

  const handleStatus = async (evt: AdminEvent, next: "APPROVED" | "REJECTED") => {
    try {
      await updateStatus({ id: evt.id, status: next }).unwrap();
      toast.success(`"${evt.title}" ${next === "APPROVED" ? "approved" : "rejected"}`);
    } catch {
      toast.error("Failed to update event status");
    }
  };

  const handleDelete = async (evt: AdminEvent) => {
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
      <PageIntro title="All events" description="Review, approve and manage every event on the platform." />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location or organizer…"
            className="pl-9"
            aria-label="Search events"
          />
        </div>
        <div className="flex w-fit rounded-lg bg-muted p-1">
          {TABS.map((t) => (
            <button
              key={t.label}
              onClick={() => setStatus(t.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                status === t.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className={cn("overflow-x-auto", isFetching && "opacity-60")}>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="h-11 px-4 font-medium">Event</th>
                <th className="h-11 px-4 font-medium">Organizer</th>
                <th className="h-11 px-4 font-medium">Date</th>
                <th className="h-11 px-4 font-medium">Booked</th>
                <th className="h-11 px-4 font-medium">Status</th>
                <th className="h-11 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td colSpan={6} className="p-4">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-destructive">
                    Failed to load events.
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    No events found.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="border-t transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image src={eventImage(evt)} alt="" fill sizes="44px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-56 truncate font-medium">{evt.title}</p>
                          <p className="max-w-56 truncate text-xs text-muted-foreground">{evt.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {evt.organizer?.name || evt.organizer?.email || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {new Date(evt.date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {evt._count.rsvps}
                      {evt.capacity ? <span className="text-muted-foreground"> / {evt.capacity}</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      <EventStatusBadge status={evt.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {evt.status !== "APPROVED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => handleStatus(evt, "APPROVED")}
                          >
                            <CheckCircle2 className="size-4 text-green-600" /> Approve
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="size-8" aria-label="More actions">
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
                            {evt.status !== "REJECTED" && (
                              <DropdownMenuItem onClick={() => handleStatus(evt, "REJECTED")}>
                                <XCircle /> Reject
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DeleteConfirmation
                              title={`Delete "${evt.title}"?`}
                              description="Events with paid bookings can't be deleted — reject them instead."
                              onConfirm={() => handleDelete(evt)}
                            >
                              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                                <Trash2 /> Delete
                              </DropdownMenuItem>
                            </DeleteConfirmation>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && !isError && (
          <p className="border-t px-4 py-3 text-xs text-muted-foreground">
            {events.length} event{events.length === 1 ? "" : "s"}
          </p>
        )}
      </Card>
    </div>
  );
}
