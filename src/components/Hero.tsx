import { Star } from "lucide-react";
import Link from "next/link";
import { AnimatedTooltip } from "./ui/animated-tooltip";
import { Spotlight } from "./ui/spotlight";

interface HeroProps {
  heading?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
  };
  reviews?: {
    count: number;
    rating?: number;
  };
}

const people = [
  {
    id: 1,
    name: "John Doe",
    designation: "Software Engineer",
    image: "/images/clients/client1.jpg",
  },
  {
    id: 2,
    name: "Robert Johnson",
    designation: "Product Manager",
    image: "/images/clients/client2.jpg",
  },
  {
    id: 3,
    name: "Jane Smith",
    designation: "Data Scientist",
    image: "/images/clients/client3.jpg",
  },
  {
    id: 4,
    name: "Emily Davis",
    designation: "UX Designer",
    image: "/images/clients/client4.jpg",
  },
  {
    id: 5,
    name: "Tyler Durden",
    designation: "Soap Developer",
    image: "/images/clients/client5.jpg",
  },
];

export function Hero({
  heading = "Plan and Manage Your Events Seamlessly",
  description = "Eventers helps you create, organize, and track your events with ease. From RSVPs to payments, manage everything in one place.",
  button = {
    text: "Get Started Today",
    url: "/events",
  },
  reviews = {
    count: 500,
    rating: 4.9,
  },
}: HeroProps) {
  return (
    <div className="relative flex min-h-[36rem] w-full overflow-hidden antialiased md:items-center md:justify-center">

      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="var(--spotlight)"
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 text-center">
          <h1 className="bg-opacity-50 bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-4xl font-bold text-transparent md:text-7xl">
            {heading}
          </h1>
          <p className="mx-auto max-w-lg text-base font-normal text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <Link href={button.url} className="bg-inverse-border no-underline group cursor-pointer relative shadow-2xl shadow-inverse rounded-full p-px text-xs font-semibold leading-6 text-inverse-foreground inline-block">
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,color-mix(in_oklab,var(--glow)_60%,transparent)_0%,transparent_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
            </span>
            <div className="relative flex space-x-2 items-center z-10 rounded-full bg-inverse py-0.5 px-4 ring-1 ring-inverse-foreground/10">
              <span>{button.text}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M10.75 8.75L14.25 12L10.75 15.25"
                ></path>
              </svg>
            </div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-glow-accent/0 via-glow-accent/90 to-glow-accent/0 transition-opacity duration-500 group-hover:opacity-40"></span>
          </Link>
        </div>

        <div className="mx-auto mt-10 flex w-fit flex-col items-center gap-4 sm:flex-row">
          <span className="mx-4 inline-flex items-center -space-x-4">
            {/* {reviews.avatars.map((avatar, index) => (
              <Avatar key={index} className="size-14 border">
                <AnimatedTooltip items={people} />
              </Avatar>
            ))} */}
            <AnimatedTooltip items={people} />
          </span>
          <div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className="size-5 fill-rating text-rating"
                />
              ))}
              <span className="mr-1 font-semibold text-foreground">
                {reviews.rating?.toFixed(1)}
              </span>
            </div>
            <p className="text-left font-medium text-muted-foreground">
              trusted by {reviews.count}+ event organizers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
