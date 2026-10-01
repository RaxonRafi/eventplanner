import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FALLBACK_EVENT_IMAGES = [
  "/images/about-1.jpg",
  "/images/about-2.jpg",
  "/images/about-3.jpg",
  "/images/clients/client1.jpg",
  "/images/clients/client2.jpg",
  "/images/clients/client3.jpg",
  "/images/clients/client4.jpg",
  "/images/clients/client5.jpg",
];

/** The event's own banner, or a stable per-event fallback so cards don't all share one image. */
export function eventImage(evt: { id: string; bannerImage?: string | null }) {
  if (evt.bannerImage) return evt.bannerImage;
  let hash = 0;
  for (const ch of evt.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACK_EVENT_IMAGES[hash % FALLBACK_EVENT_IMAGES.length];
}
