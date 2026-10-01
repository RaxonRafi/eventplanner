"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLogoutMutation } from "@/redux/features/auth/auth.api";
import { useUserInfoQuery } from "@/redux/features/User/user.api";
import {
  Bell,
  CalendarDays,
  ChevronsUpDown,
  Compass,
  CreditCard,
  Globe,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import Logo from "../../public/svg/Logo";

type Role = "ADMIN" | "ORGANIZER" | "USER";
type NavItem = { title: string; url: string; icon: LucideIcon };
type NavSection = { label: string; items: NavItem[] };

function getNav(role: Role | null): NavSection[] {
  if (role === "ADMIN")
    return [
      {
        label: "Overview",
        items: [
          { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
          { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
        ],
      },
      {
        label: "Management",
        items: [
          { title: "Events", url: "/dashboard/events", icon: CalendarDays },
          { title: "Users", url: "/dashboard/users", icon: Users },
          { title: "RSVPs", url: "/dashboard/rsvps", icon: Ticket },
          { title: "Payments", url: "/dashboard/payments", icon: CreditCard },
        ],
      },
    ];
  if (role === "ORGANIZER")
    return [
      {
        label: "Overview",
        items: [
          { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
          { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
        ],
      },
      {
        label: "Events",
        items: [
          { title: "My Events", url: "/dashboard/events", icon: CalendarDays },
          { title: "RSVPs", url: "/dashboard/rsvps", icon: Ticket },
          { title: "Payments", url: "/dashboard/payments", icon: CreditCard },
        ],
      },
    ];
  return [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
      ],
    },
    {
      label: "My Activity",
      items: [
        { title: "My Bookings", url: "/dashboard/rsvps", icon: Ticket },
        { title: "Explore Events", url: "/events", icon: Compass },
      ],
    },
  ];
}

/** The nav item whose URL is the longest prefix of the current path — exactly one is active. */
function activeUrl(sections: NavSection[], pathname: string) {
  return sections
    .flatMap((s) => s.items.map((i) => i.url))
    .filter((url) => pathname === url || pathname.startsWith(url + "/"))
    .sort((a, b) => b.length - a.length)[0];
}

const ROLE_LABEL: Record<Role, string> = { ADMIN: "Admin", ORGANIZER: "Organizer", USER: "Member" };

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const { data, isLoading } = useUserInfoQuery(undefined);
  const user = data?.data as { name?: string; email?: string; role?: Role } | undefined;
  const role = user?.role ?? null;
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const sections = React.useMemo(() => getNav(role), [role]);
  const active = activeUrl(sections, pathname);
  const name = user?.name || user?.email || "Account";
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const closeOnMobile = () => isMobile && setOpenMobile(false);

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
    } catch {}
    router.push("/login");
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" onClick={closeOnMobile}>
                <Logo />
                <div className="flex flex-col leading-none">
                  <span className="font-semibold">Eventers</span>
                  <span className="text-xs text-muted-foreground">
                    {isLoading ? "Loading…" : role ? `${ROLE_LABEL[role]} workspace` : "Dashboard"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={item.url === active} tooltip={item.title}>
                    <Link href={item.url} onClick={closeOnMobile}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary">
                    {initials}
                  </span>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
                className="w-56 rounded-lg"
              >
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ShieldCheck className="size-3" /> {role ? ROLE_LABEL[role] : "—"}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Globe /> Back to site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} variant="destructive">
                  <LogOut /> {isLoggingOut ? "Logging out…" : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
