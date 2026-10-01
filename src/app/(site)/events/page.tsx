"use client";
import {
  EventPreview,
  EventPreviewCard,
  EventPreviewCardSkeleton,
} from "@/components/EventPreviewCard";
import { Button } from "@/components/ui/button";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn, eventImage } from "@/lib/utils";
import { usePublicEventsQuery } from "@/redux/features/Event/event.api";
import { CalendarX2, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

type PublicEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  bannerImage?: string | null;
  capacity?: number | null;
  minPrice?: number | null;
};

type When = "upcoming" | "past" | "all";
type Sort = "latest" | "soonest" | "date_desc";

const TABS: { label: string; value: When }[] = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Past", value: "past" },
  { label: "All", value: "all" },
];

const SORTS: { label: string; value: Sort }[] = [
  { label: "Latest added", value: "latest" },
  { label: "Date: soonest", value: "soonest" },
  { label: "Date: latest", value: "date_desc" },
];

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [when, setWhen] = useState<When>("upcoming");
  const [sort, setSort] = useState<Sort>("latest");
  const [search, setSearch] = useState("");
  // Only query the API once typing has paused
  const q = useDebounce(search.trim(), 400);
  const limit = 9;

  // New search term -> back to the first page
  useEffect(() => setPage(1), [q]);

  const { data, isLoading, isFetching, isError } = usePublicEventsQuery({
    page,
    limit,
    q: q || undefined,
    sort,
    when,
  });

  const events: PublicEvent[] = data?.data ?? [];
  const total: number = data?.meta?.total ?? 0;
  const totalPages: number = data?.meta?.totalPages ?? 1;

  return (
    <section className="relative pb-20 pt-10 md:pt-14">
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex justify-center">
            <HoverBorderGradient
              containerClassName="rounded-full"
              className="bg-background text-foreground"
            >
              <span>All events</span>
            </HoverBorderGradient>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Browse events</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Discover concerts, workshops, meetups and more — book your spot in seconds.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border bg-card/80 p-3 shadow-sm backdrop-blur md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description or location…"
              className="h-10 border-0 bg-transparent pl-9 pr-9 shadow-none focus-visible:ring-0"
              aria-label="Search events"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-muted p-1" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  role="tab"
                  aria-selected={when === t.value}
                  onClick={() => {
                    setWhen(t.value);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    when === t.value
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
              onChange={(e) => {
                setSort(e.target.value as Sort);
                setPage(1);
              }}
              className="h-9 rounded-lg border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

        {!isLoading && !isError && (
          <p className="mb-4 text-sm text-muted-foreground">
            {total} {total === 1 ? "event" : "events"}
            {q ? ` matching “${q}”` : ""}
          </p>
        )}

        {isError ? (
          <div className="rounded-2xl border bg-card py-16 text-center text-muted-foreground">
            Failed to load events. Please try again.
          </div>
        ) : isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventPreviewCardSkeleton key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card py-16 text-center">
            <CalendarX2 className="size-10 text-muted-foreground" />
            <p className="font-medium">No events found</p>
            <p className="text-sm text-muted-foreground">
              Try a different search or switch tabs.
            </p>
            {(q || when !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setWhen("all");
                }}
              >
                Show all events
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-6 transition-opacity md:grid-cols-2 lg:grid-cols-3",
              isFetching && "opacity-60"
            )}
          >
            {events.map((evt) => {
              const item: EventPreview = {
                id: evt.id,
                title: evt.title,
                summary: evt.description ?? "",
                date: evt.date,
                location: evt.location,
                url: `/events/${evt.id}`,
                image: eventImage(evt),
                minPrice: evt.minPrice,
                capacity: evt.capacity,
              };
              return <EventPreviewCard key={item.id} evt={item} />;
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
