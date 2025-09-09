import { About } from "@/components/About";
import { FeaturedEvents } from "@/components/Events";
import { Faq } from "@/components/Faq";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <>
      <section id="home">
        <Hero />
      </section>
      <section id="about">
        <About />
      </section>
      <section id="events">
        <FeaturedEvents />
      </section>
      <section id="faq">
        <Faq />
      </section>
    </>
  );
}
