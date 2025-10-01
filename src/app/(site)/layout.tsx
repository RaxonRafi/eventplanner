import { Footer } from "@/components/Footer";
import { NavbarComponent } from "@/components/Navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarComponent />
      <main className="pt-20">{children}</main>
      <Footer />
    </>
  );
}
