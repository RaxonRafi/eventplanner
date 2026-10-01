import { DashboardOverview } from "@/components/DashboardOverview";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

export default async function Page() {
  const token = (await cookies()).get("token")?.value;
  let role: string | undefined;
  if (token) {
    try {
      role = (jwt.verify(token, JWT_SECRET) as { role?: string }).role;
    } catch {
      // show default dashboard
    }
  }
  // redirect() throws, so it must stay outside the try/catch above
  if (role === "ADMIN") redirect("/dashboard/admin");

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardOverview />
      </div>
    </SidebarInset>
  );
}
