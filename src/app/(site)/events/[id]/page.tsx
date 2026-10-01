"use client";
import EventDetails from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { eventImage } from "@/lib/utils";
import { useEventByIdQuery } from "@/redux/features/Event/event.api";
import {
  useCreateRsvpMutation,
  useMyRsvpsQuery,
} from "@/redux/features/Reservation/rsvp.api";
import { useUserInfoQuery } from "@/redux/features/User/user.api";
import { CalendarX2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EventPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const { data, isLoading, isError } = useEventByIdQuery(id, { skip: !id });
  const [createRsvp] = useCreateRsvpMutation();
  const { data: me } = useUserInfoQuery(undefined);
  const isLoggedIn = Boolean(me?.data?.id);
  const { data: myRsvpData } = useMyRsvpsQuery(
    { eventId: id, page: 1, limit: 1 },
    { skip: !id || !isLoggedIn }
  );
  // An unpaid RSVP (failed/cancelled payment) can be retried; only a paid one blocks
  const alreadyRsvped = myRsvpData?.data?.[0]?.paid === true;

  if (!id) return null;
  if (isLoading)
    return (
      <div className="pb-20">
        <Skeleton className="h-[42vh] min-h-72 w-full rounded-none" />
        <div className="container mx-auto grid gap-8 px-4 pt-8 lg:grid-cols-[1fr_380px] lg:px-16">
          <div className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  if (isError || !data)
    return (
      <div className="container mx-auto flex flex-col items-center gap-3 px-4 py-32 text-center">
        <CalendarX2 className="size-12 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Event not found</h1>
        <p className="text-muted-foreground">
          This event may have been removed or isn&apos;t published yet.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/events">Browse events</Link>
        </Button>
      </div>
    );

  const date = new Date(data.date);
  const isPast = date < new Date();

  return (
    <EventDetails
      event={{
        id: data.id,
        title: data.title,
        coverImage: eventImage(data),
        date,
        location: data.location,
        capacity: data.capacity ?? undefined,
        seatsTaken: data._count?.rsvps ?? 0,
        description: data.description ?? "",
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
      }}
      onSelectPackage={async (pkg) => {
        if (!isLoggedIn) {
          toast.info("Please sign in to book this event");
          router.push(`/login?redirect=/events/${data.id}`);
          return;
        }
        try {
          const res = await createRsvp({
            eventId: data.id,
            packageId: pkg.id,
          }).unwrap();
          const redirectUrl = res?.paymentUrl as string | undefined;
          if (!redirectUrl) throw new Error();
          toast.loading("Redirecting to secure payment…");
          window.location.href = redirectUrl;
          // keep the button in its loading state while the browser navigates away
          await new Promise(() => {});
        } catch (err: unknown) {
          const e = err as { status?: number; data?: { error?: string } };
          if (e?.status === 401) {
            toast.info("Your session expired — please sign in again");
            router.push(`/login?redirect=/events/${data.id}`);
            return;
          }
          if (e?.status === 409) {
            toast.warning(e?.data?.error || "You already have a booking for this event");
            return;
          }
          toast.error(e?.data?.error || "Couldn't start the payment. Please try again.");
        }
      }}
      rsvpDisabledReason={
        isPast ? "Event ended" : alreadyRsvped ? "Already booked" : undefined
      }
    />
  );
}
