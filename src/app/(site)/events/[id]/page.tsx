"use client";
import EventDetails from "@/components/EventCard";
import { useEventByIdQuery } from "@/redux/features/Event/event.api";
import {
  useCreateRsvpMutation,
  useMyRsvpsQuery,
} from "@/redux/features/Reservation/rsvp.api";
import { useParams } from "next/navigation";

export default function EventPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { data, isLoading, isError } = useEventByIdQuery(id, { skip: !id });
  const [createRsvp] = useCreateRsvpMutation();
  const { data: myRsvpData } = useMyRsvpsQuery(
    { eventId: id, page: 1, limit: 1 },
    { skip: !id }
  );
  const alreadyRsvped = (myRsvpData?.data?.length ?? 0) > 0;

  if (!id) return null;
  if (isLoading) return <div className="container py-24">Loading…</div>;
  if (isError)
    return <div className="container py-24">Failed to load event.</div>;
  if (!data) return <div className="container py-24">Event not found.</div>;

  const date = new Date(data.date);
  const dateLabel = date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <EventDetails
      event={{
        id: data.id,
        title: data.title,
        coverImage: "/images/about-1.jpg",
        dateLabel,
        durationLabel: undefined,
        location: data.location,
        capacity: data.capacity ?? undefined,
        descriptionHtml: data.description ?? "",
        organizer: {
          id: data.organizer?.id ?? "",
          name: data.organizer?.name ?? "Organizer",
        },
        packages: (data.packages ?? []).map(
          (p: { id: string; name: string; price: number }) => ({
            id: p.id,
            name: p.name,
            price: p.price,
          })
        ),
        shareLinks: [],
        venueMapUrl: undefined,
        guidelinesUrl: undefined,
      }}
      onSelectPackage={async (pkg) => {
        if (alreadyRsvped) {
          alert("You already have an RSVP for this event.");
          return;
        }
        try {
          const res = await createRsvp({
            eventId: data.id,
            packageId: pkg.id,
          }).unwrap();
          const redirectUrl = res?.paymentUrl as string | undefined;
          if (redirectUrl) window.location.href = redirectUrl;
        } catch (err: unknown) {
          const e = err as { status?: number; data?: { error?: string } };
          if (e?.status === 401) {
            window.location.href = `/login?redirect=/events/${data.id}`;
            return;
          }
          if (e?.status === 409) {
            alert("You already have an RSVP for this event.");
            return;
          }
          alert(e?.data?.error || "Failed to create RSVP");
        }
      }}
      detailsCtaUrl="/events"
    />
  );
}
