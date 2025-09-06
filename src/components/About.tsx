import { Button } from "@/components/ui/button";
import Logo from "../../public/svg/Logo";


interface About3Props {
  title?: string;
  description?: string;
  mainImage?: { src: string; alt: string };
  secondaryImage?: { src: string; alt: string };
  breakout?: {
    src: string;
    alt: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
  companiesTitle?: string;
  companies?: Array<{ src: string; alt: string }>;
  achievementsTitle?: string;
  achievementsDescription?: string;
  achievements?: Array<{ label: string; value: string }>;
}

const defaultCompanies = [
  { src: "/logos/partner-1.svg", alt: "VenuePro" },
  { src: "/logos/partner-2.svg", alt: "Caterly" },
  { src: "/logos/partner-3.svg", alt: "StageCraft" },
  { src: "/logos/partner-4.svg", alt: "TicketWave" },
  { src: "/logos/partner-5.svg", alt: "LightBox" },
  { src: "/logos/partner-6.svg", alt: "SoundHub" },
];

const defaultAchievements = [
  { label: "Events Managed", value: "1,200+" },
  { label: "RSVPs Processed", value: "250k+" },
  { label: "Avg. Satisfaction", value: "4.9/5" },
  { label: "Vendors Onboarded", value: "350+" },
];

const About = ({
  title = "About Eventers",
  description = "Eventers is the all-in-one platform for planning and managing events—from conferences and workshops to festivals and private celebrations. Create events, publish packages, collect RSVPs and payments, and track everything in one place.",
  mainImage = {
    src: "/images/about-1.jpg",
    alt: "People enjoying a well organized event",
  },
  secondaryImage = {
    src: "/images/about-2.jpg",
    alt: "Backstage coordination at an event",
  },
  breakout = {
      title: "Made for Organizers, Loved by Guests",
      description: "Build beautiful event pages, manage capacity, offer tiered packages, and accept secure payments via SSLCommerz with real-time status updates.",
      buttonText: "Create your first event",
      buttonUrl: "/events/new",
      src: "",
      alt: ""
  },
  companiesTitle = "Trusted by teams, venues & creators",
  companies = defaultCompanies,
  achievementsTitle = "Our Impact in Numbers",
  achievementsDescription =
    "We focus on reliability, seamless guest experiences, and tools that help organizers scale without the chaos.",
  achievements = defaultAchievements,
}: About3Props = {}) => {
  return (
    <section className="py-32">
      <div className="container mx-auto px-10">
        <div className="mb-14 grid gap-5 text-center md:grid-cols-2 md:text-left">
          <h1 className="text-5xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="grid gap-7 lg:grid-cols-3">
          <img
            src={mainImage.src}
            alt={mainImage.alt}
            className="size-full max-h-[620px] rounded-xl object-cover lg:col-span-2"
          />

          <div className="flex flex-col gap-7 md:flex-row lg:flex-col">
            <div className="flex flex-col justify-between gap-6 rounded-xl bg-muted p-7 md:w-1/2 lg:w-auto">
              <Logo/>
              <div>
                <p className="mb-2 text-lg font-semibold">{breakout.title}</p>
                <p className="text-muted-foreground">{breakout.description}</p>
              </div>
              <Button variant="outline" className="mr-auto" asChild>
                <a href={breakout.buttonUrl}>{breakout.buttonText}</a>
              </Button>
            </div>

            <img
              src={secondaryImage.src}
              alt={secondaryImage.alt}
              className="grow basis-0 rounded-xl object-cover md:w-1/2 lg:min-h-0 lg:w-auto"
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-muted p-10 md:p-16 mt-32">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h2 className="text-4xl font-semibold">{achievementsTitle}</h2>
            <p className="max-w-xl text-muted-foreground">{achievementsDescription}</p>
          </div>

          <div className="mt-10 flex flex-wrap justify-between gap-10 text-center">
            {achievements.map((item, idx) => (
              <div className="flex flex-col gap-4" key={item.label + idx}>
                <p>{item.label}</p>
                <span className="text-4xl font-semibold md:text-5xl">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute -top-1 right-1 z-10 hidden h-full w-full bg-[linear-gradient(to_right,hsl(var(--muted-foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted-foreground))_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom_right,#000,transparent,transparent)] bg-[size:80px_80px] opacity-15 md:block"></div>
        </div>
      </div>
    </section>
  );
};

export { About };
