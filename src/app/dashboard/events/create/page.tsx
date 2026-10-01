import { PageHeader, PageIntro } from "@/components/dashboard/PageHeader";
import { EventForm } from "@/components/forms/EventForm";
import { SidebarInset } from "@/components/ui/sidebar";

export default function CreateEventPage() {
  return (
    <SidebarInset>
      <PageHeader title="Create Event" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <PageIntro
          title="Create a new event"
          description="Fill in the details below. Your event goes live once an admin approves it."
        />
        <EventForm />
      </div>
    </SidebarInset>
  );
}
