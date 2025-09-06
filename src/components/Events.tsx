import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

type EventCard = {
  id: string;
  title: string;
  summary: string;
  date: string;       // ISO or formatted
  location: string;
  url: string;        // detail page e.g. `/events/[id]`
  image: string;      // cover image
};

interface FeaturedEventsProps {
  tagline?: string;
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string; // defaults to /events
  events?: EventCard[];
}

export function FeaturedEvents({
  tagline = "Don’t miss out",
  heading = "Upcoming Events",
  description = "Here are a few highlights coming up soon. Explore all events for more.",
  buttonText = "View all events",
  buttonUrl = "/events",
  events = [
    {
      id: "cmf6va0b80001txrckcm5jopb",
      title: "Tech Innovators Summit 2025",
      summary:
        "A full-day summit on AI, product growth, and developer tooling with hands-on sessions.",
      date: "2025-10-05",
      location: "Dhaka, Bangladesh",
      url: "/events/cmf6va0b80001txrckcm5jopb",
      image: "/images/about-1.jpg",
    },
    {
      id: "cmf6va0b80001txrckcm5jopbfd",
      title: "Design & UX Conf",
      summary:
        "Learn modern UX patterns, design systems, and accessibility from industry leaders.",
      date: "2025-11-12",
      location: "Chattogram, Bangladesh",
      url: "/events/evt-2",
      image: "/images/about-1.jpg",
    },
    {
      id: "cmf6va0b80001txrckcm5jopbf",
      title: "Startup Founders Meetup",
      summary:
        "Early-stage founders meet investors, share stories, and find collaborators.",
      date: "2025-12-02",
      location: "Sylhet, Bangladesh",
      url: "/events/evt-3",
      image: "/images/about-1.jpg",
    },
    // ...more events (will show only first 3)
  ],
}: FeaturedEventsProps) {
  const items = events.slice(0, 3);

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
          {items.map((evt) => (
            <Card key={evt.id} className="grid grid-rows-[auto_auto_1fr_auto] pt-0">
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
                <Link href={evt.url} className="flex items-center hover:underline">
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
