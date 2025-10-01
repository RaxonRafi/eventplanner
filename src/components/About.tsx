"use client";
import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { WobbleCard } from "@/components/ui/wobble-card";
import { cn } from "@/lib/utils";



interface CountUpProps {
  endValue: string;
  duration?: number;
}

const CountUp = ({ endValue, duration = 2.5 }: CountUpProps) => {

  const endNumber = parseFloat(endValue.replace(/[^\d.]/g, ''));

  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => {
    
    const displayValue = latest;

    if (endValue.includes('/5')) {

      return displayValue.toFixed(1) + '/5';
    }
    
    if (endValue.includes('k')) {
 
      const thousands = Math.round(displayValue / 1000);
      return thousands.toLocaleString() + 'k+';
    }

    if (endValue.includes('+')) {

        return Math.floor(displayValue).toLocaleString() + '+';
    }

    return Math.round(displayValue).toLocaleString();
  });

  useEffect(() => {
    const controls = animate(count, endNumber, { duration });
    return () => controls.stop();
  }, [count, endNumber, duration]);

  return <motion.span>{rounded}</motion.span>;
};


interface AboutProps {
  title?: string;
  description?: string;
  achievementsTitle?: string;
  achievementsDescription?: string;
  achievements?: Array<{ label: string; value: string }>;
}

const defaultAchievements = [
  { label: "Events Managed", value: "1,200+" },
  { label: "RSVPs Processed", value: "25000+" },
  { label: "Avg. Satisfaction", value: "4.9/5" },
  { label: "Vendors Onboarded", value: "350+" },
];

const About = ({
  title = "About Eventers",
  description = "Eventers is the all-in-one platform for planning and managing events—from conferences and workshops to festivals and private celebrations.",
  achievementsTitle = "Our Impact in Numbers",
  achievementsDescription = "We focus on reliability, seamless guest experiences, and tools that help organizers scale without the chaos.",
  achievements = defaultAchievements,
}: AboutProps = {}) => {
  return (
    <section className="relative min-h-screen bg-black py-32">
      {/* background grid */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 select-none",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
        )}
      />

      <div className="relative z-10 container mx-auto px-6">
        {/* heading */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl md:text-6xl font-bold text-transparent">
            {title}
          </h2>
          <p className="mt-4 text-lg text-neutral-300">{description}</p>
        </div>

        {/* Wobble Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full overflow-hidden">
          {/* Card 1: Main Image Background */}
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-2 h-full min-h-[400px] lg:min-h-[300px] overflow-hidden relative"
            className="bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/about-1.jpg')" }}
          >
            <div className="absolute inset-0 bg-black/50 rounded-2xl"></div>
            <div className="max-w-xs z-10 relative p-6">
              <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Eventers powers the entire event universe
              </h2>
              <p className="mt-4 text-left text-base/6 text-neutral-200">
                With over 1,200+ events managed and 250k+ RSVPs processed,
                Eventers is the most popular event management platform for
                organizers.
              </p>
            </div>
          </WobbleCard>

          {/* Card 2: No Image Background */}
          <WobbleCard containerClassName="col-span-1 min-h-[300px] overflow-hidden relative bg-indigo-700 rounded-2xl">
            <div className="z-10 relative p-6">
              <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Made for Organizers, Loved by Guests
              </h2>
              <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
                Build beautiful event pages, manage capacity, offer tiered
                packages, and accept secure payments.
              </p>
            </div>
          </WobbleCard>

          {/* Card 3: Secondary Image Background */}
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-3 min-h-[400px] lg:min-h-[300px] overflow-hidden relative"
            className="bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/about-2.jpg')" }}
          >
            <div className="absolute inset-0 bg-black/50 rounded-2xl"></div>
            <div className="max-w-sm z-10 relative p-6">
              <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Create your first event today!
              </h2>
              <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
                Join thousands of event organizers who trust Eventers to make
                their events unforgettable.
              </p>
            </div>
          </WobbleCard>
        </div>
        {/* End Wobble Card Layout */}

        {/* achievements (Cleaned up, no EvervaultCard) */}
        <div className="mt-32 w-full">
            {/* Original achievements div restored */}
            <div className="relative overflow-hidden rounded-xl bg-black/50 p-10 md:p-16 shadow-xl border border-neutral-800">
                
                {/* Content */}
                <div className="relative z-10">
                    <div className="text-center md:text-left">
                        <h3 className="text-3xl md:text-5xl font-bold text-white">
                            {achievementsTitle}
                        </h3>
                        <p className="mt-4 max-w-xl text-neutral-400">
                            {achievementsDescription}
                        </p>
                    </div>

                    <div className="mt-12 flex flex-wrap justify-center md:justify-between gap-12">
                        {achievements.map((item, idx) => (
                            <div
                                key={item.label + idx}
                                className="flex flex-col gap-2 text-center"
                            >
                                <span className="text-4xl md:text-5xl font-bold text-white">
                                    {/* Using Framer Motion CountUp component */}
                                    <CountUp endValue={item.value} />
                                </span>
                                <p className="text-neutral-400">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export { About };