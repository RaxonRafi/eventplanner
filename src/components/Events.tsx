"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import {
  EventPreview,
  EventPreviewCard,
  EventPreviewCardSkeleton,
} from "@/components/EventPreviewCard";
import { Button } from "@/components/ui/button";

type EventCard = EventPreview;

interface FeaturedEventsProps {
  tagline?: string;
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string; // defaults to /events
  events?: EventCard[];
}

import { eventImage } from "@/lib/utils";
import { usePublicEventsQuery } from "@/redux/features/Event/event.api";
import { HoverBorderGradient } from "./ui/hover-border-gradient";

export function FeaturedEvents({
  tagline = "Don’t miss out",
  heading = "Upcoming Events",
  description = "Here are a few highlights coming up soon. Explore all events for more.",
  buttonText = "View all events",
  buttonUrl = "/events",
  events,
}: FeaturedEventsProps) {
  const { data, isLoading } = usePublicEventsQuery({
    page: 1,
    limit: 3,
    sort: "latest",
    when: "upcoming",
  });
  const apiItems: EventCard[] = (data?.data ?? []).map(
    (e: {
      id: string;
      title: string;
      description: string | null;
      date: string;
      location: string;
      bannerImage?: string | null;
      capacity?: number | null;
      minPrice?: number | null;
    }) => ({
      id: e.id,
      title: e.title,
      summary: e.description ?? "",
      date: e.date,
      location: e.location,
      url: `/events/${e.id}`,
      image: eventImage(e),
      minPrice: e.minPrice,
      capacity: e.capacity,
    })
  );
  const items = events ?? apiItems;

  return (
    <section className="relative min-h-screen bg-background py-32">
      {/* background grid */}
      <div
        className="pointer-events-none absolute inset-0 select-none bg-grid"
      />
      <div className="container mx-auto z-10 relative flex flex-col items-center gap-16 lg:px-16">
        <div className="text-center">
          <div className="mb-6 flex justify-center text-center">
            <HoverBorderGradient
              containerClassName="rounded-full"
              className="bg-background text-foreground flex items-center space-x-2"
            >
              <span>{tagline}</span>
            </HoverBorderGradient>
          </div>
          <h2 className="mb-3 text-3xl font-semibold text-pretty md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
            {description}
          </p>
          <Button asChild variant="link" className="w-full sm:w-auto">
            <Link href={buttonUrl}>
              {buttonText}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {isLoading && !events
            ? Array.from({ length: 3 }).map((_, i) => <EventPreviewCardSkeleton key={i} />)
            : items.map((evt: EventCard) => <EventPreviewCard key={evt.id} evt={evt} />)}
        </div>
      </div>
    </section>
  );
}
