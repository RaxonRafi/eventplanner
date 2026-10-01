import { UserList } from "@/components/Admin/UserList";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SidebarInset } from "@/components/ui/sidebar";

const page = () => {
  return (
     <SidebarInset>
      <PageHeader title="Users" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <UserList/>

      </div>
    </SidebarInset>
  
  )
}

export default page