import { EventList } from "@/components/Admin/EventList";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

const page = () => {
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
        <EventList/>

      </div>
    </SidebarInset>
  
  )
}

export default page