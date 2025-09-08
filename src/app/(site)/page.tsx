import { About } from "@/components/About";
import { FeaturedEvents } from "@/components/Events";
import { Faq } from "@/components/Faq";
import { Hero } from "@/components/Hero";


export default function Home() {
  return (
    <>
      <Hero/>
      <About/>
      <FeaturedEvents/>
      <Faq/>
    </>

  );
}
