"use client";
import { EventPreview, EventPreviewCard } from "@/components/EventPreviewCard";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePublicEventsQuery } from "@/redux/features/Event/event.api";
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
    <section className="relative min-h-screen bg-black py-24">
      <div className="pointer-events-none absolute inset-0 select-none [background-size:40px_40px] [background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]" />
      <div className="container relative z-10 mx-auto px-4 lg:px-16">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="mb-4 flex justify-center">
            <HoverBorderGradient
              containerClassName="rounded-full"
              className="dark:bg-black bg-white text-black dark:text-white"
            >
              <span> All events</span>
            </HoverBorderGradient>
          </div>
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
              events.map((evt) => {
                const item: EventPreview = {
                  id: evt.id,
                  title: evt.title,
                  summary: evt.description ?? "",
                  date: new Date(evt.date).toISOString().slice(0, 10),
                  location: evt.location,
                  url: `/events/${evt.id}`,
                  image: "/images/about-1.jpg",
                };
                return <EventPreviewCard key={item.id} evt={item} />;
              })
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
