"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePublicEventsQuery } from "@/redux/features/Event/event.api";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type PublicEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
};

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const limit = 12;
  const { data, isLoading, isError } = usePublicEventsQuery({ page, limit });

  const events: PublicEvent[] = data?.data ?? [];
  const totalPages: number = data?.meta?.totalPages ?? 1;

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 lg:px-16">
        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-4">
            All events
          </Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Browse events</h1>
          <p className="text-muted-foreground mt-2">
            Discover and RSVP to upcoming events.
          </p>
        </div>

        {isLoading && <div>Loading events…</div>}
        {isError && <div>Failed to load events.</div>}

        {!isLoading && !isError && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {events.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground">
                No events found.
              </div>
            ) : (
              events.map((evt) => (
                <Card
                  key={evt.id}
                  className="grid grid-rows-[auto_auto_1fr_auto] pt-0"
                >
                  <div className="aspect-16/9 w-full">
                    <Link
                      href={`/events/${evt.id}`}
                      className="transition-opacity duration-200 fade-in hover:opacity-75"
                    >
                      <img
                        src="/images/about-1.jpg"
                        alt={evt.title}
                        className="h-full w-full object-cover object-center rounded-t-lg"
                      />
                    </Link>
                  </div>
                  <CardHeader>
                    <h3 className="text-lg font-semibold hover:underline md:text-xl">
                      <Link href={`/events/${evt.id}`}>{evt.title}</Link>
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="size-4" />
                        {new Date(evt.date).toISOString().slice(0, 10)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="size-4" />
                        {evt.location}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">
                      {evt.description ?? ""}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/events/${evt.id}`}
                      className="flex items-center hover:underline"
                    >
                      View details
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    size="default"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={
                      page === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        size="default"
                        isActive={page === p}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    size="default"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </section>
  );
}
