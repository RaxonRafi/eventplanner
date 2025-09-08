"use client";

import { useLogoutMutation } from "@/redux/features/auth/auth.api";
import { useUserInfoQuery } from "@/redux/features/User/user.api";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type NavItem = { title: string; url: string };
type NavGroup = { title: string; url: string; items?: NavItem[] };

function getNavForRole(role: "ADMIN" | "ORGANIZER" | "USER" | null): {
  navMain: NavGroup[];
} {
  if (role === "ADMIN") {
    return {
      navMain: [
        { title: "Dashboard", url: "/dashboard" },
        {
          title: "Management",
          url: "#",
          items: [
            { title: "Users", url: "/dashboard/users" },
            { title: "Events", url: "/dashboard/events" },
            { title: "RSVPs", url: "/dashboard/rsvps" },
            { title: "Payments", url: "/dashboard/payments" },
          ],
        },
      ],
    };
  }

  if (role === "ORGANIZER") {
    return {
      navMain: [
        { title: "Dashboard", url: "/dashboard" },
        {
          title: "Events",
          url: "#",
          items: [
            { title: "My Events", url: "/dashboard/events" },
            { title: "Create Event", url: "/dashboard/events/create" },
            { title: "RSVPs", url: "/dashboard/rsvps" },
            { title: "Payments", url: "/dashboard/payments" },
          ],
        },
      ],
    };
  }

  return {
    navMain: [
      { title: "Dashboard", url: "/dashboard" },
      {
        title: "My Activity",
        url: "#",
        items: [
          { title: "My RSVPs", url: "/dashboard/rsvps" },
          { title: "Explore Events", url: "/events" },
        ],
      },
    ],
  };
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading, isError } = useUserInfoQuery(undefined);
  const role = (data?.data?.role as "ADMIN" | "ORGANIZER" | "USER") ?? null;
  const userLabel = data?.data?.name || data?.data?.email || "User";
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const nav = React.useMemo(() => getNavForRole(role), [role]);

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Event Planner</span>
                  <span className="text-xs text-muted-foreground">
                    {isLoading
                      ? "Loading…"
                      : isError
                      ? "Guest"
                      : role ?? "User"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {nav.navMain.map((group) => {
              const hasChildren = !!group.items?.length;
              const isActiveTop =
                group.url !== "#"
                  ? pathname === group.url || pathname.startsWith(group.url)
                  : false;

              return (
                <SidebarMenuItem key={group.title}>
                  <SidebarMenuButton asChild isActive={isActiveTop}>
                    <Link
                      href={group.url !== "#" ? group.url : pathname}
                      className="font-medium"
                    >
                      {group.title}
                    </Link>
                  </SidebarMenuButton>

                  {hasChildren ? (
                    <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                      {group.items!.map((child) => {
                        const active =
                          pathname === child.url ||
                          pathname.startsWith(child.url);
                        return (
                          <SidebarMenuSubItem key={child.title}>
                            <SidebarMenuSubButton asChild isActive={active}>
                              <Link href={child.url}>{child.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              );
            })}

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={async () => {
                  try {
                    await logout().unwrap();
                  } catch {}
                  router.push("/login");
                }}
                aria-disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* tiny status footer (optional) */}
        <div className="p-3 text-[11px] text-muted-foreground">
          {isLoading
            ? "Fetching profile…"
            : isError
            ? "Not signed in"
            : `Signed in as ${userLabel}`}
        </div>
      </SidebarContent>

      {/* <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => {
                try {
                  await logout().unwrap();
                } catch {}
                router.push("/login");
              }}
              aria-disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  );
}
