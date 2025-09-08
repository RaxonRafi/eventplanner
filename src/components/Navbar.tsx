"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useUserInfoQuery } from "@/redux/features/User/user.api";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Logo from "../../public/svg/Logo";
import { ModeToggle } from "./ui/modeToggle";


const Navbar = () => {
  const { data } = useUserInfoQuery(undefined);
  const isLoggedIn = !!data?.data?.email;
  const features = [
    { title: "Dashboard", description: "Overview of your activity", href: "/dashboard" },
    { title: "Analytics", description: "Track your performance", href: "/dashboard/analytics" },
    // ...
  ];

  return (
    <section className="py-4">
      <div className="container mx-auto px-10">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold tracking-tighter">Eventers</span>
          </Link>

          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/about" className={navigationMenuTriggerStyle()}>About</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/events" className={navigationMenuTriggerStyle()}>Events</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/contact" className={navigationMenuTriggerStyle()}>Contact</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="hidden items-center gap-4 lg:flex">
            {isLoggedIn ? (
              <Link href="/dashboard"><Button>Dashboard</Button></Link>
            ) : (
              <Link href="/login">
                <Button>Sign in</Button>
              </Link>
            )}
            <ModeToggle />
          </div>

          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="max-h-screen overflow-auto">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2">
                    <Logo />
                    <span className="text-lg font-semibold tracking-tighter">Eventers</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col p-4">
                <Accordion type="single" collapsible className="mt-4 mb-2">
                  <AccordionItem value="solutions" className="border-none">
                    <AccordionTrigger className="text-base hover:no-underline">Features</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-2">
                        {features.map((f) => (
                          <Link key={f.href} href={f.href} className="rounded-md p-3 transition-colors hover:bg-muted/70">
                            <p className="mb-1 font-semibold text-foreground">{f.title}</p>
                            <p className="text-sm text-muted-foreground">{f.description}</p>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex flex-col gap-6">
                  <Link href="/templates" className="font-medium">Templates</Link>
                  <Link href="/blog" className="font-medium">Blog</Link>
                  <Link href="/pricing" className="font-medium">Pricing</Link>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                  {isLoggedIn ? (
                    <Link href="/dashboard"><Button>Dashboard</Button></Link>
                  ) : (
                    <Link href="/login">
                      <Button variant="outline">Sign in</Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </section>
  );
};

export { Navbar };
