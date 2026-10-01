"use client";

import {
  useAllEventsQuery,
  useAdminStatsQuery,
  useUpdateEventStatusMutation,
} from "@/redux/features/Event/event.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  CheckCircle2,
  CircleCheck,
  Clock,
  Landmark,
  MapPin,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { StatCard } from "@/components/StatCard";
import { formatBDT, PLATFORM_FEE_RATE } from "@/lib/fees";
import { usePaymentsQuery } from "@/redux/features/Payment/payment.api";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "secondary",
    APPROVED: "default",
    REJECTED: "destructive",
  };
  return (
    <Badge variant={variants[status] ?? "outline"}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

function PendingEventReview() {
  const { data: events, isLoading } = useAllEventsQuery({ status: "PENDING" });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateEventStatusMutation();

  const handleStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Event ${status === "APPROVED" ? "approved" : "declined"}`);
    } catch {
      toast.error("Failed to update event status");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const pending = events ?? [];

  if (pending.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No events pending review.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pending.map((event: {
        id: string;
        title: string;
        description?: string;
        date: string;
        location: string;
        bannerImage?: string;
        capacity?: number;
        organizer?: { name?: string; email?: string };
      }) => (
        <Card key={event.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {event.bannerImage && (
              <div className="relative h-40 w-full md:h-auto md:w-48 shrink-0">
                <Image
                  src={event.bannerImage}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {event.description}
                  </p>
                </div>
                <StatusBadge status="PENDING" />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-4" />
                  {new Date(event.date).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {event.location}
                </span>
                {event.capacity && <span>Capacity: {event.capacity}</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                Organizer: {event.organizer?.name || event.organizer?.email || "Unknown"}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={() => handleStatus(event.id, "APPROVED")}
                  disabled={isUpdating}
                >
                  <CheckCircle2 className="size-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatus(event.id, "REJECTED")}
                  disabled={isUpdating}
                >
                  <XCircle className="size-4 mr-1" />
                  Decline
                </Button>
                <Link href={`/events/${event.id}`}>
                  <Button size="sm" variant="outline">
                    Review Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

type RecentPayment = {
  id: string;
  amount: number;
  platformFee: number;
  status: string;
  createdAt: string;
  rsvp: { user: { name: string | null; email: string }; event: { title: string } };
};

function RecentPayments() {
  const { data, isLoading } = usePaymentsQuery({ limit: 6 });
  const rows: RecentPayment[] = (data?.data ?? []).filter(
    (p: RecentPayment) => p.status === "PAID" || p.status === "FAILED"
  );

  if (isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  return (
    <Card className="py-2">
      <CardContent className="divide-y px-4">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          rows.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                {p.status === "PAID" ? (
                  <CircleCheck className="size-5 shrink-0 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.rsvp.event.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.rsvp.user.name ?? p.rsvp.user.email} ·{" "}
                    {new Date(p.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-medium tabular-nums">{formatBDT(p.amount)}</p>
                {p.status === "PAID" ? (
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Fee {formatBDT(p.platformFee)}
                  </p>
                ) : (
                  <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStatsQuery(undefined);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total users" value={stats?.totalUsers ?? 0} icon={Users} loading={isLoading} />
          <StatCard
            label="Total events"
            value={stats?.totalEvents ?? 0}
            hint={`${stats?.approvedEvents ?? 0} approved`}
            icon={CalendarDays}
            loading={isLoading}
          />
          <StatCard
            label="Pending review"
            value={stats?.pendingEvents ?? 0}
            icon={Clock}
            className="text-amber-600 dark:text-amber-400"
            loading={isLoading}
          />
          <StatCard
            label="Gross sales"
            value={formatBDT(stats?.grossSales ?? 0)}
            hint={`${stats?.paidPayments ?? 0} successful payments`}
            icon={Wallet}
            loading={isLoading}
          />
          <StatCard
            label="Platform earnings"
            value={formatBDT(stats?.platformFee ?? 0)}
            hint={`${PLATFORM_FEE_RATE * 100}% of every booking`}
            icon={Landmark}
            className="text-green-600 dark:text-green-400"
            loading={isLoading}
          />
          <StatCard
            label="Failed payments"
            value={stats?.failedPayments ?? 0}
            icon={XCircle}
            className="text-red-600 dark:text-red-400"
            loading={isLoading}
          />
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Payments</h2>
              <p className="text-sm text-muted-foreground">
                Latest successful and failed transactions
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/payments">View All Payments</Link>
            </Button>
          </div>
          <RecentPayments />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Events Pending Review</h2>
              <p className="text-sm text-muted-foreground">
                Approve or decline events submitted by organizers
              </p>
            </div>
            <Link href="/dashboard/events">
              <Button variant="outline" size="sm">
                View All Events
              </Button>
            </Link>
          </div>
          <PendingEventReview />
        </section>
      </div>
    </SidebarInset>
  );
}
