/* eslint-disable @typescript-eslint/no-explicit-any */
// app/events/[id]/page.tsx (example)
"use client";
import EventDetails from "@/components/EventCard";


export default function EventPage() {
  return (
    <EventDetails
      event={{
        id: "cmf6va0b80001txrckcm5jopb",
        title: "Tech Innovators Summit 2025",
        coverImage: "/images/about-1.jpg",
        dateLabel: "Sat, Oct 5, 2025 • 10:00 AM",
        durationLabel: "6 hours",
        location: "Dhaka, Bangladesh",
        capacity: 300,
        descriptionHtml:
          "<p>Join founders, PMs and engineers for a day of deep dives on AI, growth and dev tooling.</p><h3>What you'll learn</h3><ul><li>Building AI features</li><li>Efficient product analytics</li><li>Scaling teams</li></ul>",
        organizer: { id: "org-1", name: "Eventers Team", avatarUrl: "/images/organizer.png" },
        packages: [
          { id: "p1", name: "General", price: 1999, description: "Access to all talks" },
          { id: "p2", name: "VIP", price: 3999, description: "Front row + speaker Q&A" },
        ],
        shareLinks: [
          { platform: "linkedin", href: "https://www.linkedin.com/shareArticle?mini=true&url=https://example.com/events/evt-1" },
          { platform: "x", href: "https://twitter.com/intent/tweet?url=https://example.com/events/evt-1" },
        ],
        venueMapUrl: "https://maps.google.com/?q=Dhaka",
        guidelinesUrl: "/guidelines",
      }}
      onSelectPackage={(pkg: any) => {
        // e.g. open RSVP modal or push(`/rsvp?eventId=...&packageId=...`)
        console.log("Select package", pkg);
      }}
      detailsCtaUrl="/events"
    />
  );
}
