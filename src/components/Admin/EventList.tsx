"use client";

import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { EventStatusBadge } from "@/components/dashboard/EventStatusBadge";
import {
  FilterPill,
  TableCard,
  TableMessage,
  TablePagination,
  TableSearch,
  TableSkeletonRows,
  TableToolbar,
} from "@/components/dashboard/DataTable";
import { PageIntro } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { eventImage } from "@/lib/utils";
import {
  type EventStatus,
  useAllEventsQuery,
  useDeleteEventMutation,
  useUpdateEventStatusMutation,
} from "@/redux/features/Event/event.api";
import { CheckCircle2, ExternalLink, ListFilter, MoreHorizontal, Pencil, Trash2, XCircle } from "lucide-react";
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

const STATUSES: { label: string; value?: EventStatus }[] = [
  { label: "All statuses" },
  { label: "In review", value: "PENDING" },
  { label: "Live", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export function EventList() {
  const [status, setStatus] = useState<EventStatus | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, isFetching, isError } = useAllEventsQuery({ status });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateEventStatusMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [toDelete, setToDelete] = useState<AdminEvent | null>(null);

  const events: AdminEvent[] = useMemo(() => {
    const all: AdminEvent[] = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((e) =>
      [e.title, e.location, e.organizer?.name, e.organizer?.email].some((v) => v?.toLowerCase().includes(q))
    );
  }, [data, search]);

  // The API returns every event, so paging happens here
  const currentPage = Math.min(page, Math.max(1, Math.ceil(events.length / pageSize)));
  const rows = events.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

      <TableCard
        fetching={isFetching}
        toolbar={
          <TableToolbar
            search={
              <TableSearch
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, location or organizer…"
                aria-label="Search events"
              />
            }
          >
            <FilterPill
              label="Filter by status"
              icon={ListFilter}
              options={STATUSES}
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            />
          </TableToolbar>
        }
        footer={
          !isLoading &&
          !isError && (
            <TablePagination
              page={currentPage}
              pageSize={pageSize}
              total={events.length}
              noun="events"
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Event</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Booked</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows cols={6} />
            ) : isError ? (
              <TableMessage colSpan={6} error>
                Failed to load events.
              </TableMessage>
            ) : rows.length === 0 ? (
              <TableMessage colSpan={6}>No events found.</TableMessage>
            ) : (
              rows.map((evt) => (
                <TableRow key={evt.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image src={eventImage(evt)} alt="" fill sizes="44px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-56 truncate font-semibold">{evt.title}</p>
                        <p className="max-w-56 truncate text-xs text-muted-foreground">{evt.location}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {evt.organizer?.name || evt.organizer?.email || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(evt.date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {evt._count.rsvps}
                    {evt.capacity ? <span className="text-muted-foreground"> / {evt.capacity}</span> : null}
                  </TableCell>
                  <TableCell>
                    <EventStatusBadge status={evt.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {evt.status !== "APPROVED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          disabled={isUpdating}
                          onClick={() => handleStatus(evt, "APPROVED")}
                        >
                          <CheckCircle2 className="size-4 text-green-600" /> Approve
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="size-8 rounded-full" aria-label="More actions">
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
                          <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(evt)}>
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableCard>

      <DeleteConfirmation
        open={toDelete != null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete "${toDelete?.title}"?`}
        description="Events with paid bookings can't be deleted — reject them instead."
        onConfirm={() => toDelete && handleDelete(toDelete)}
      />
    </div>
  );
}
