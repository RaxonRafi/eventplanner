"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Check,
  Clock,
  Link2,
  Loader2,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

type EventPackage = {
  id: string;
  name: string;
  price: number; // BDT
  description?: string;
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
    coverImage: string;
    date: Date;
    location: string;
    capacity?: number;
    seatsTaken?: number;
    description: string; // plain text
    organizer: Organizer;
    packages: EventPackage[];
  };
  /** Called with the chosen package; resolves when the redirect to payment has started (or failed). */
  onSelectPackage: (pkg: EventPackage) => Promise<void>;
  rsvpDisabledReason?: string; // e.g. "Event ended" — disables booking and shows this label
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const fmtTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

function googleCalendarUrl(title: string, start: Date, location: string, details: string) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // assume 2 hours
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    location,
    details: details.slice(0, 500),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export default function EventDetails({ event, onSelectPackage, rsvpDisabledReason }: EventDetailsProps) {
  const { title, coverImage, date, location, capacity, seatsTaken = 0, description, organizer, packages } =
    event;
  const [selectedId, setSelectedId] = useState(packages[0]?.id);
  const [booking, setBooking] = useState(false);
  const selected = packages.find((p) => p.id === selectedId) ?? packages[0];
  const seatsLeft = typeof capacity === "number" ? Math.max(0, capacity - seatsTaken) : undefined;
  const soldOut = seatsLeft === 0;
  const disabledReason = rsvpDisabledReason ?? (soldOut ? "Sold out" : undefined);

  const book = async () => {
    if (!selected || disabledReason) return;
    setBooking(true);
    try {
      await onSelectPackage(selected);
    } finally {
      setBooking(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="relative h-[42vh] min-h-72 w-full overflow-hidden bg-muted">
        <Image src={coverImage} alt={title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="container relative mx-auto flex h-full flex-col justify-end px-4 pb-8 lg:px-16">
          <Link
            href="/events"
            className="mb-auto mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-sm backdrop-blur transition-colors hover:bg-background"
          >
            <ArrowLeft className="size-4" /> All events
          </Link>
          <div className="flex flex-wrap gap-2">
            <Badge className="gap-1.5 bg-background/85 text-foreground backdrop-blur hover:bg-background/85">
              <CalendarDays className="size-3.5" /> {fmtDate(date)}
            </Badge>
            <Badge className="gap-1.5 bg-background/85 text-foreground backdrop-blur hover:bg-background/85">
              <MapPin className="size-3.5" /> {location}
            </Badge>
            {rsvpDisabledReason === "Event ended" && <Badge variant="secondary">Ended</Badge>}
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>
        </div>
      </div>

      <div className="container mx-auto grid gap-8 px-4 pt-8 lg:grid-cols-[1fr_380px] lg:px-16">
        {/* Main */}
        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="mb-3 text-xl font-semibold">About this event</h2>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
              {description || "No description provided."}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Tickets</h2>
            {packages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No packages available right now.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Ticket packages">
                {packages.map((pkg) => {
                  const active = pkg.id === selected?.id;
                  return (
                    <button
                      key={pkg.id}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSelectedId(pkg.id)}
                      className={cn(
                        "flex items-start justify-between gap-4 rounded-xl border p-4 text-left transition-all",
                        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-foreground/30"
                      )}
                    >
                      <div>
                        <p className="font-semibold">{pkg.name}</p>
                        {pkg.description && (
                          <p className="mt-1 text-xs text-muted-foreground">{pkg.description}</p>
                        )}
                        <p className="mt-2 text-lg font-bold">BDT {pkg.price.toLocaleString()}</p>
                      </div>
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                          active && "border-primary bg-primary text-primary-foreground"
                        )}
                      >
                        {active && <Check className="size-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Organizer</h2>
            <div className="flex items-center gap-3">
              {organizer.avatarUrl ? (
                <Image
                  src={organizer.avatarUrl}
                  alt={organizer.name}
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {organizer.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium">{organizer.name}</p>
                <p className="text-sm text-muted-foreground">Event organizer</p>
              </div>
            </div>
          </section>
        </div>

        {/* Booking sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="gap-0 py-0 shadow-lg">
            <CardContent className="space-y-5 p-6">
              <div>
                <p className="text-sm text-muted-foreground">{selected ? selected.name : "Tickets"}</p>
                <p className="text-3xl font-bold">
                  {selected ? `BDT ${selected.price.toLocaleString()}` : "—"}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span>{fmtDate(date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="size-4 text-muted-foreground" />
                  <span>{fmtTime(date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>{location}</span>
                </div>
                {seatsLeft !== undefined && (
                  <div className="flex items-center gap-3">
                    <Users className="size-4 text-muted-foreground" />
                    <span>
                      {soldOut ? "Sold out" : `${seatsLeft.toLocaleString()} of ${capacity!.toLocaleString()} seats left`}
                    </span>
                  </div>
                )}
              </div>

              <Button className="h-11 w-full text-base" disabled={!!disabledReason || !selected || booking} onClick={book}>
                {booking ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Redirecting to payment…
                  </>
                ) : disabledReason ? (
                  disabledReason
                ) : (
                  <>
                    <Ticket className="size-4" /> Book now
                  </>
                )}
              </Button>
              {!disabledReason && (
                <p className="text-center text-xs text-muted-foreground">
                  Secure payment via SSLCommerz
                </p>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={googleCalendarUrl(title, date, location, description)} target="_blank" rel="noopener noreferrer">
                    <CalendarPlus className="size-4" /> Calendar
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={copyLink}>
                  <Link2 className="size-4" /> Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
