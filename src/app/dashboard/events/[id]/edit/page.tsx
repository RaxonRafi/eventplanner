"use client";

import { EventStatusBadge } from "@/components/dashboard/EventStatusBadge";
import { PageHeader, PageIntro } from "@/components/dashboard/PageHeader";
import { EventForm, type EditableEvent } from "@/components/forms/EventForm";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventByIdQuery } from "@/redux/features/Event/event.api";
import { useUserInfoQuery } from "@/redux/features/User/user.api";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type ApiEvent = Omit<EditableEvent, "packages" | "confirmedBookings"> & {
  organizerId: string;
  packages: { id: string; name: string; price: number; _count?: { rsvps: number } }[];
  _count?: { rsvps: number };
};

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useEventByIdQuery(id, { skip: !id });
  const { data: me } = useUserInfoQuery(undefined);
  const event = data as ApiEvent | undefined;
  const user = me?.data as { id: string; role: string } | undefined;
  const canEdit = event && user && (user.role === "ADMIN" || event.organizerId === user.id);

  return (
    <SidebarInset>
      <PageHeader title="Edit Event" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {isLoading || !user ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <Skeleton className="h-[32rem] rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : isError || !event || !canEdit ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
            <p className="font-medium">Event not found</p>
            <p className="text-sm text-muted-foreground">
              It may have been deleted, or you don&apos;t have permission to edit it.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/events">Back to events</Link>
            </Button>
          </div>
        ) : (
          <>
            <PageIntro
              title={event.title}
              description="Update your event's details, banner and ticket packages."
              actions={
                <>
                  <EventStatusBadge status={event.status} />
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/events">
                      <ArrowLeft className="size-4" /> Back
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/events/${event.id}`}>
                      <ExternalLink className="size-4" /> View page
                    </Link>
                  </Button>
                </>
              }
            />
            <EventForm
              key={event.id}
              event={{
                id: event.id,
                title: event.title,
                description: event.description,
                date: event.date,
                location: event.location,
                capacity: event.capacity,
                bannerImage: event.bannerImage,
                status: event.status,
                confirmedBookings: event._count?.rsvps ?? 0,
                packages: event.packages.map((p) => ({
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  bookings: p._count?.rsvps ?? 0,
                })),
              }}
            />
          </>
        )}
      </div>
    </SidebarInset>
  );
}
