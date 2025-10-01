"use client";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  Navbar,
  NavbarButton,
  NavBody,
  NavItems,
} from "@/components/ui/resizable-navbar";
import { useUserInfoQuery } from "@/redux/features/User/user.api";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "../../public/svg/Logo";
import { HoverBorderGradient } from "./ui/hover-border-gradient";

export function NavbarComponent() {
  const { data } = useUserInfoQuery(undefined);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  const isLoggedIn = mounted && !!data?.data?.email;

  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "About",
      link: "/#about",
    },
    {
      name: "Events",
      link: "/events",
    },
    {
      name: "FAQ",
      link: "/#faq",
    },
  ];

  const CustomNavbarLogo = () => {
    return (
      <Link
        href="/"
        className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
      >
        <Logo />
        <span className="font-medium text-black dark:text-white">Eventers</span>
      </Link>
    );
  };

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <CustomNavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            {mounted &&
              (isLoggedIn ? (
                <NavbarButton as={Link} href="/dashboard" variant="primary">
                  Dashboard
                </NavbarButton>
              ) : (
                <NavbarButton as={Link} href="/login" variant="secondary">
                      <div className=" flex justify-center text-center">
                        <HoverBorderGradient
                          containerClassName="rounded-full"
                          as="button"
                          className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                        >
                          <span>Sign In</span>
                        </HoverBorderGradient>
                      </div>
                </NavbarButton>
              ))}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <CustomNavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </Link>
            ))}
            <div className="flex w-full flex-col gap-4">
              {mounted &&
                (isLoggedIn ? (
                  <NavbarButton
                    as={Link}
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                  >
                    Dashboard
                  </NavbarButton>
                ) : (
                  <NavbarButton
                    as={Link}
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                  >
                    Sign in
                  </NavbarButton>
                ))}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
