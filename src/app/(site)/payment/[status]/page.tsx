import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CircleCheck, CircleX, Ban } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const STATES = {
  success: {
    icon: CircleCheck,
    color: "text-success",
    title: "Payment successful",
    message: "Your RSVP is confirmed. See you at the event!",
  },
  fail: {
    icon: CircleX,
    color: "text-destructive",
    title: "Payment failed",
    message:
      "We couldn't complete your payment. You have not been charged — you can try again from the event page.",
  },
  cancel: {
    icon: Ban,
    color: "text-muted-foreground",
    title: "Payment cancelled",
    message: "You cancelled the payment. Your RSVP is not confirmed yet.",
  },
} as const;

export default async function PaymentResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ status: string }>;
  searchParams: Promise<{ tran_id?: string }>;
}) {
  const { status } = await params;
  const { tran_id } = await searchParams;
  const state = STATES[status as keyof typeof STATES];
  if (!state) notFound();
  const Icon = state.icon;

  return (
    <section className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-24">
      <Card className="w-full max-w-md text-center shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <Icon className={`size-14 ${state.color}`} />
          <h1 className="text-2xl font-semibold">{state.title}</h1>
          <p className="text-muted-foreground">{state.message}</p>
          {tran_id && (
            <p className="text-xs text-muted-foreground break-all">
              Transaction: {tran_id}
            </p>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/dashboard/rsvps">My RSVPs</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/events">Browse events</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
