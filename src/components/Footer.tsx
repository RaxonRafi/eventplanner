import Link from "next/link";
import Logo from "../../public/svg/Logo";

const sections = [
  {
    title: "Explore",
    links: [
      { name: "Home", href: "/" },
      { name: "Browse events", href: "/events" },
      { name: "About", href: "/#about" },
      { name: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Organizers",
    links: [
      { name: "Create an event", href: "/dashboard/events/create" },
      { name: "My events", href: "/dashboard/events" },
      { name: "Payments", href: "/dashboard/payments" },
    ],
  },
  {
    title: "Account",
    links: [
      { name: "Sign in", href: "/login" },
      { name: "Create account", href: "/register" },
      { name: "My bookings", href: "/dashboard/rsvps" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Link href="/" className="flex w-fit items-center gap-2">
              <Logo />
              <span className="text-xl font-semibold">Eventers</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Discover events, book tickets in seconds, and run your own events with secure
              payments built in.
            </p>
          </div>
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-foreground">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Eventers. All rights reserved.</p>
          <p>Payments secured by SSLCommerz</p>
        </div>
      </div>
    </footer>
  );
}
