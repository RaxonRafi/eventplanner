"use client";

import { EventList } from "@/components/Admin/EventList";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { OrgEventList } from "@/components/Organizer/OrgEventList";
import { SidebarInset } from "@/components/ui/sidebar";
import { useUserInfoQuery } from "@/redux/features/User/user.api";

const Page = () => {
  const { data, isLoading } = useUserInfoQuery(undefined);
  const role = data?.data?.role;

  return (
    <SidebarInset>
      <PageHeader title="Events" />

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {isLoading && <p>Loading...</p>}

        {!isLoading && role === "ADMIN" && <EventList />}
        {!isLoading && role === "ORGANIZER" && <OrgEventList />}

        {!isLoading && role !== "ADMIN" && role !== "ORGANIZER" && (
          <p className="text-muted-foreground">You don’t have permission to view this page.</p>
        )}
      </div>
    </SidebarInset>
  );
};

export default Page;
