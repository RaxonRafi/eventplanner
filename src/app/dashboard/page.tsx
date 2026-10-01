import { DashboardOverview } from "@/components/DashboardOverview";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SidebarInset } from "@/components/ui/sidebar";
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
      <PageHeader title="Dashboard" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <DashboardOverview />
      </div>
    </SidebarInset>
  );
}
