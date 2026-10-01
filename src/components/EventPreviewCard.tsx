"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type EventPreview = {
  id: string;
  title: string;
  summary: string;
  date: string; // ISO date string
  location: string;
  url: string;
  image: string;
  minPrice?: number | null; // BDT
  capacity?: number | null;
};

export function EventPreviewCard({ evt }: { evt: EventPreview }) {
  const date = new Date(evt.date);
  const isPast = date < new Date();

  return (
    <Link
      href={evt.url}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={evt.image}
          alt={evt.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isPast ? "grayscale-[60%]" : ""}`}
        />
        <div className="absolute left-3 top-3 flex flex-col items-center rounded-xl bg-background/90 px-3 py-1.5 text-center shadow-sm backdrop-blur">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {date.toLocaleString("en-US", { month: "short" })}
          </span>
          <span className="text-xl font-bold leading-none">{date.getDate()}</span>
        </div>
        {isPast && (
          <Badge variant="secondary" className="absolute right-3 top-3 bg-background/90 backdrop-blur">
            Ended
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1.5">
          <h3 className="line-clamp-1 text-lg font-semibold tracking-tight">{evt.title}</h3>
          <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{evt.summary}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{evt.location}</span>
          </span>
          {evt.capacity ? (
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4 shrink-0" />
              {evt.capacity} seats
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between border-t pt-4">
          <span className="text-sm">
            {evt.minPrice != null ? (
              <>
                <span className="text-muted-foreground">From </span>
                <span className="font-semibold">BDT {evt.minPrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-muted-foreground">
                {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            )}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            {isPast ? "View details" : "Book now"}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function EventPreviewCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default EventPreviewCard;
