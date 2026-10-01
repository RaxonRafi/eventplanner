"use client";

import { CreateEventForm } from "@/components/forms/createEventForm";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SidebarInset } from "@/components/ui/sidebar";

const Page = () => {
  return (
    <SidebarInset>
      <PageHeader title="Create Event" />

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <CreateEventForm />
      </div>
    </SidebarInset>
  );
};

export default Page;
