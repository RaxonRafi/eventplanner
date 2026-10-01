import { Footer } from "@/components/Footer";
import { NavbarComponent } from "@/components/Navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen bg-background">
      {/* One fixed grid behind every section, so there are no seams between them */}
      <div className="pointer-events-none fixed inset-0 -z-10 select-none bg-grid" />
      <NavbarComponent />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}
