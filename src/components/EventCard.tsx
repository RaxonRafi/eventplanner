"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Clock,
  Download,
  MapPin,
  Share2,
  Ticket,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// Reusable preview card available for listing contexts
// import { EventPreviewCard, EventPreview } from "@/components/EventPreviewCard";

type EventPackage = {
  id: string;
  name: string;
  price: number; // BDT
  description?: string;
  ctaText?: string; // e.g. "Reserve"
};

type Organizer = {
  id: string;
  name: string;
  avatarUrl?: string;
};

interface EventDetailsProps {
  event: {
    id: string;
    title: string;
    coverImage?: string; // /images/event-cover.jpg
    dateLabel: string; // preformatted: "Sat, Oct 5, 2025 • 10:00 AM"
    durationLabel?: string; // "6 hours" (optional)
    location: string; // "Dhaka, Bangladesh"
    capacity?: number; // optional
    descriptionHtml: string; // trusted HTML (sanitized upstream)
    organizer: Organizer;
    packages: EventPackage[];
    readTimeLabel?: string; // optional helper like "2 min read" (can omit)
    shareLinks?: {
      platform: "instagram" | "linkedin" | "x" | "facebook";
      href: string;
    }[];
    // Optional helpful links:
    venueMapUrl?: string;
    guidelinesUrl?: string;
  };
  onSelectPackage?: (pkg: EventPackage) => void; // If you want to open RSVP modal
  detailsCtaUrl?: string; // Fallback RSVP link if no handler provided
}

export default function EventDetails({
  event,
  onSelectPackage,
  detailsCtaUrl = "/events",
}: EventDetailsProps) {
  const {
    title,
    coverImage = "/images/about-1.jpg",
    dateLabel,
    durationLabel,
    location,
    capacity,
    descriptionHtml,
    organizer,
    packages,
    readTimeLabel,
    shareLinks = [],
    venueMapUrl,
    guidelinesUrl,
  } = event;

  return (
    <section className="py-32">
      <div className="container px-10 grid md:grid-cols-12">
        {/* Sidebar */}
        <aside className="order-last md:order-none md:col-span-4 lg:col-span-3">
          <div className="flex flex-col gap-6">
            {/* Event meta */}
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-muted/50 px-5 py-4">
                <h3 className="flex items-center text-sm font-semibold">
                  <CalendarDays className="text-muted-foreground mr-2.5 size-3.5" />
                  Event Details
                </h3>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="size-4 mt-0.5 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">{dateLabel}</p>
                    {durationLabel && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Clock className="size-3.5" /> {durationLabel}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="size-4 mt-0.5 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">{location}</p>
                    {venueMapUrl && (
                      <Link
                        href={venueMapUrl}
                        className="text-primary hover:underline text-xs"
                      >
                        View on map
                      </Link>
                    )}
                  </div>
                </div>

                {typeof capacity === "number" && (
                  <div className="flex items-start gap-3">
                    <Users className="size-4 mt-0.5 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">Capacity</p>
                      <p className="text-muted-foreground">{capacity} seats</p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Organizer */}
                <div className="flex items-center gap-3">
                  {organizer.avatarUrl ? (
                    <Image
                      src={organizer.avatarUrl}
                      alt={organizer.name}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-9 rounded-full bg-muted" />
                  )}
                  <div className="text-sm">
                    <p className="font-medium">Organized by</p>
                    <p className="text-muted-foreground">{organizer.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ticket / Packages */}
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-muted/50 px-5 py-4">
                <h3 className="flex items-center text-sm font-semibold">
                  <Ticket className="text-muted-foreground mr-2.5 size-3.5" />
                  Packages
                </h3>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {packages.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No packages available right now.
                  </p>
                )}
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="border rounded-lg p-4 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{pkg.name}</p>
                        <Badge variant="secondary">
                          BDT {pkg.price.toFixed(0)}
                        </Badge>
                      </div>
                      {pkg.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {pkg.description}
                        </p>
                      )}
                    </div>
                    {onSelectPackage ? (
                      <Button size="sm" onClick={() => onSelectPackage(pkg)}>
                        {pkg.ctaText ?? "RSVP"}
                      </Button>
                    ) : (
                      <Button asChild size="sm">
                        <Link
                          href={`${detailsCtaUrl}/${event.id}?pkg=${pkg.id}`}
                        >
                          {pkg.ctaText ?? "RSVP"}
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
                {guidelinesUrl && (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Please review our{" "}
                    <Link
                      href={guidelinesUrl}
                      className="text-primary hover:underline"
                    >
                      event guidelines
                    </Link>{" "}
                    before booking.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Download / Share */}
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-muted/50 px-5 py-4">
                <h3 className="flex items-center text-sm font-semibold">
                  <Share2 className="text-muted-foreground mr-2.5 size-3.5" />
                  Share this event
                </h3>
              </CardHeader>
              <CardContent className="p-5">
                <ul className="flex items-center gap-2">
                  {shareLinks.length ? (
                    shareLinks.map((s) => (
                      <li key={s.platform}>
                        <Link
                          href={s.href}
                          className="border-border bg-muted/50 hover:bg-muted flex size-10 items-center justify-center rounded-full border transition-colors"
                          aria-label={`Share on ${s.platform}`}
                          target="_blank"
                        >
                          {/* You can swap to icons per platform if you prefer */}
                          <span className="text-xs capitalize">
                            {s.platform}
                          </span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="text-xs text-muted-foreground">
                        No share links configured
                      </li>
                    </>
                  )}
                </ul>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Button className="w-full justify-between" variant="outline">
                    Download Brochure
                    <Download className="ml-2 size-4" />
                  </Button>
                  <Button className="w-full justify-between" variant="ghost">
                    Add to Calendar
                    <CalendarDays className="ml-2 size-4" />
                  </Button>
                  {readTimeLabel && (
                    <p className="text-muted-foreground mt-4 text-center text-xs">
                      Read time: {readTimeLabel}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Main content */}
        <div className="md:col-span-7 md:col-start-5 lg:col-start-6">
          {/* Cover */}
          <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-lg">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <article className="prose dark:prose-invert prose-sm max-w-none">
            <h1>{title}</h1>

            {/* Top chips */}
            <div className="not-prose mt-3 flex flex-wrap items-center gap-3">
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-2"
              >
                <CalendarDays className="size-3.5" /> {dateLabel}
              </Badge>
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <MapPin className="size-3.5" /> {location}
              </Badge>
              {durationLabel && (
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-2"
                >
                  <Clock className="size-3.5" /> {durationLabel}
                </Badge>
              )}
            </div>

            {/* Description (HTML from CMS/backend – sanitize upstream) */}
            <div
              className="mt-6"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />

            {/* Quick CTA */}
            {packages.length > 0 && (
              <div className="not-prose mt-8 flex flex-wrap gap-3">
                {packages.slice(0, 2).map((pkg) => (
                  <Button
                    key={pkg.id}
                    onClick={() => onSelectPackage?.(pkg)}
                    asChild={!onSelectPackage}
                  >
                    {onSelectPackage ? (
                      <span>
                        RSVP — {pkg.name} (BDT {pkg.price.toFixed(0)})
                      </span>
                    ) : (
                      <Link href={`${detailsCtaUrl}/${event.id}?pkg=${pkg.id}`}>
                        RSVP — {pkg.name} (BDT {pkg.price.toFixed(0)})
                      </Link>
                    )}
                  </Button>
                ))}
                <Button variant="outline" asChild>
                  <Link href="/events">See all events</Link>
                </Button>
              </div>
            )}

            {/* Optional sections: agenda, FAQs, etc. (add as you like) */}
          </article>

          {/* Related/More events (example usage of reusable card) */}
          {/* You can map other events and render <EventPreviewCard evt={...} /> here if needed */}
        </div>
      </div>
    </section>
  );
}
