/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Organizer/OrgEventList.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarDays, MapPin } from "lucide-react";
import { useOrgEventsQuery } from "@/redux/features/Event/event.api";

function useQueryState() {
  const router = useRouter();
  const sp = useSearchParams();

  const page = Number(sp.get("page") ?? 1);
  const limit = Number(sp.get("limit") ?? 10);
  const q = sp.get("q") ?? "";
  const sort = sp.get("sort") ?? "date:desc";

  const setParams = React.useCallback(
    (next: Partial<{ page: number; limit: number; q: string; sort: string }>) => {
      const params = new URLSearchParams(sp.toString());
      if (next.page) params.set("page", String(next.page));
      if (next.limit) params.set("limit", String(next.limit));
      if (typeof next.q === "string") params.set("q", next.q);
      if (next.sort) params.set("sort", next.sort);
      router.replace(`?${params.toString()}`);
    },
    [router, sp]
  );

  return { page, limit, q, sort, setParams };
}

export function OrgEventList() {
  const { page, limit, q, sort, setParams } = useQueryState();
  const { data, isLoading, isFetching, error } = useOrgEventsQuery({
    page,
    limit,
    q,
    sort,
  });

  const [search, setSearch] = React.useState(q);
  // small debounce so we don't refetch on every keypress
  React.useEffect(() => {
    const t = setTimeout(() => setParams({ page: 1, q: search }), 400);
    return () => clearTimeout(t);
  }, [search, setParams]);

  const onPrev = () => page > 1 && setParams({ page: page - 1 });
  const onNext = () =>
    data && page < data.meta.totalPages && setParams({ page: page + 1 });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, description, location…"
          className="w-full sm:w-72"
        />
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={sort}
          onChange={(e) => setParams({ sort: e.target.value, page: 1 })}
        >
          <option value="date:desc">Date ↓</option>
          <option value="date:asc">Date ↑</option>
          <option value="createdAt:desc">Created ↓</option>
          <option value="createdAt:asc">Created ↑</option>
          <option value="title:asc">Title A→Z</option>
          <option value="title:desc">Title Z→A</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-destructive">Failed to load events.</p>
          </CardContent>
        </Card>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((evt:any) => (
              <Card key={evt.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold leading-tight">
                      <Link href={`/events/${evt.id}`} className="hover:underline">
                        {evt.title}
                      </Link>
                    </h3>
                    {typeof evt._count?.rsvps === "number" && (
                      <span className="text-xs text-muted-foreground">
                        RSVPs: {evt._count.rsvps}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" />
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(evt.date))}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4" />
                    <span>{evt.location}</span>
                  </div>
                  {typeof evt.capacity === "number" && (
                    <div className="text-muted-foreground">Capacity: {evt.capacity}</div>
                  )}
                  <div className="pt-2 flex gap-2">
                    <Link href={`/dashboard/events/${evt.id}`}>
                      <Button size="sm" variant="outline">Manage</Button>
                    </Link>
                    <Link href={`/events/${evt.id}`}>
                      <Button size="sm">View</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Page {data.meta.page} of {data.meta.totalPages} • {data.meta.total} total
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onPrev} disabled={page <= 1 || isFetching}>
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onNext}
                disabled={!data || page >= data.meta.totalPages || isFetching}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No events found.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
