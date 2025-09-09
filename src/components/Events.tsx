"use client";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

type EventCard = {
  id: string;
  title: string;
  summary: string;
  date: string; // ISO or formatted
  location: string;
  url: string; // detail page e.g. `/events/[id]`
  image: string; // cover image
};

interface FeaturedEventsProps {
  tagline?: string;
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string; // defaults to /events
  events?: EventCard[];
}

import { usePublicEventsQuery } from "@/redux/features/Event/event.api";

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
    <section className="py-32">
      <div className="container mx-auto flex flex-col items-center gap-16 lg:px-16">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6">
            {tagline}
          </Badge>
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
            <Card
              key={evt.id}
              className="grid grid-rows-[auto_auto_1fr_auto] pt-0"
            >
              <div className="aspect-16/9 w-full">
                <Link
                  href={evt.url}
                  className="transition-opacity duration-200 fade-in hover:opacity-75"
                >
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="h-full w-full object-cover object-center rounded-t-lg"
                  />
                </Link>
              </div>

              <CardHeader>
                <h3 className="text-lg font-semibold hover:underline md:text-xl">
                  <Link href={evt.url}>{evt.title}</Link>
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4" />
                    {evt.date}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4" />
                    {evt.location}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground">{evt.summary}</p>
              </CardContent>

              <CardFooter>
                <Link
                  href={evt.url}
                  className="flex items-center hover:underline"
                >
                  View details
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
