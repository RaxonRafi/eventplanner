"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { EventPreview, EventPreviewCard } from "@/components/EventPreviewCard";
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

import { cn } from "@/lib/utils";
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
  const { data } = usePublicEventsQuery({ page: 1, limit: 3 });
  const apiItems = (data?.data ?? []).map(
    (e: {
      id: string;
      title: string;
      description: string | null;
      date: string;
      location: string;
    }) => ({
      id: e.id,
      title: e.title,
      summary: e.description ?? "",
      date: new Date(e.date).toISOString().slice(0, 10),
      location: e.location,
      url: `/events/${e.id}`,
      image: "/images/about-1.jpg",
    })
  );
  const items = events ?? apiItems;

  return (
    <section className="relative min-h-screen bg-black py-32">
      {/* background grid */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 select-none",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
        )}
      />
      <div className="container mx-auto z-10 relative flex flex-col items-center gap-16 lg:px-16">
        <div className="text-center">
          <div className="mb-6 flex justify-center text-center">
            <HoverBorderGradient
              containerClassName="rounded-full"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {items.map((evt: EventCard) => (
            <EventPreviewCard key={evt.id} evt={evt} />
          ))}
        </div>
      </div>
    </section>
  );
}
