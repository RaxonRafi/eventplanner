"use client";

import { EventList } from "@/components/Admin/EventList";
import { OrgEventList } from "@/components/Organizer/OrgEventList";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserInfoQuery } from "@/redux/features/User/user.api";

export default function EventsPage() {
  const { data, isLoading } = useUserInfoQuery(undefined);
  const role = data?.data?.role;

  return (
    <SidebarInset>
      <PageHeader title={role === "ADMIN" ? "Events" : "My Events"} />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {isLoading ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : role === "ADMIN" ? (
          <EventList />
        ) : role === "ORGANIZER" ? (
          <OrgEventList />
        ) : (
          <p className="text-muted-foreground">You don&apos;t have permission to view this page.</p>
        )}
      </div>
    </SidebarInset>
  );
}
