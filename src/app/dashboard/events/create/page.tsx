"use client";

import { EventList } from "@/components/Admin/EventList";
import { CreateEventForm } from "@/components/forms/createEventForm";
import { OrgEventList } from "@/components/Organizer/OrgEventList";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useUserInfoQuery } from "@/redux/features/User/user.api";

const Page = () => {
  const { data, isLoading } = useUserInfoQuery(undefined);
  const role = data?.data?.role;

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <CreateEventForm/>
      </div>
    </SidebarInset>
  );
};

export default Page;
