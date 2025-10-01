"use client";

import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";

import Image from "next/image";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";

export type EventPreview = {
  id: string;
  title: string;
  summary: string;
  date: string;
  location: string;
  url: string;
  image: string;
};

export function EventPreviewCard({ evt }: { evt: EventPreview }) {
  return (
    <>
      <CardContainer
        className="inter-var w-full"
        containerClassName="!p-0 !py-0 !block !flex-none !items-stretch !justify-start w-full"
      >
        <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-4 border">
          <CardItem
            translateZ="50"
            className="text-xl font-bold text-neutral-600 dark:text-white"
          >
            <Link href={evt.url}>{evt.title}</Link>
          </CardItem>
          <CardItem
            as="p"
            translateZ="60"
            className="text-muted-foreground text-sm mt-2"
          >
            {evt.summary}
          </CardItem>
          <CardItem translateZ="100" className="w-full mt-4">
            <Image
              src={evt.image}
              alt="thumbnail"
              width={1000}
              height={1000}
              className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            />
          </CardItem>

          <div className="flex justify-between items-center mt-6">
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4" />
                {evt.date}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" />
                {evt.location}
              </span>
            </div>

            <CardItem
              translateZ={20}
              as="a"
              href={evt.url}
              target="__blank"
              className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
            >
              Book now →
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
      {/* <Card className="grid grid-rows-[auto_auto_1fr_auto] pt-0">
      <div className="aspect-16/9 w-full">
        <Link
          href={evt.url}
          className="transition-opacity duration-200 fade-in hover:opacity-75"
        >
          <img
            src={evt.image}
            alt={evt.title}
            className="h-full w-full object-cover object-center rounded-t-lg"
          />
        </Link>
      </div>

      <CardHeader>
        <h3 className="text-lg font-semibold hover:underline md:text-xl">
          <Link href={evt.url}>{evt.title}</Link>
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" />
            {evt.date}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4" />
            {evt.location}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground">{evt.summary}</p>
      </CardContent>

      <CardFooter>
        <Link href={evt.url} className="flex items-center hover:underline">
          View details
          <ArrowRight className="ml-2 size-4" />
        </Link>
      </CardFooter>
    </Card> */}
    </>
  );
}

export default EventPreviewCard;
