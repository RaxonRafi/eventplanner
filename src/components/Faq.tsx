import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Faq5Props {
  badge?: string;
  heading?: string;
  description?: string;
  faqs?: FaqItem[];
}

const defaultFaqs: FaqItem[] = [
  {
    question: "How do I create an event?",
    answer:
      "Go to Dashboard → Events → Create Event. Add title, date, location, capacity, and publish. You can attach one or more packages for pricing (e.g., General, VIP).",
  },
  {
    question: "Who can create or edit events?",
    answer:
      "Admins (and Organizers if enabled) can create and manage events. Regular users can RSVP and manage their own reservations only.",
  },
  {
    question: "How do packages and pricing work?",
    answer:
      "Each event can have multiple packages with different prices and benefits. Users select a package during RSVP; the amount is used to generate a payment session.",
  },
  {
    question: "How do RSVPs and payments work?",
    answer:
      "When a user RSVPs, we create a pending reservation and an unpaid payment record. After a successful SSLCommerz payment, the payment is marked PAID and the RSVP status becomes CONFIRMED.",
  },
  {
    question: "Can attendees cancel their RSVP?",
    answer:
      "Yes. Users can cancel from My Reservations before the event date. If you support refunds, an admin/organizer can process them according to your policy.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We integrate with SSLCommerz (sandbox/live). It supports cards, mobile banking, and internet banking based on your merchant configuration.",
  },
  {
    question: "How is event capacity enforced?",
    answer:
      "Capacity is checked when the RSVP is created and revalidated on payment success. Once the confirmed count reaches capacity, new RSVPs are blocked.",
  },
  {
    question: "Where can I see all RSVPs?",
    answer:
      "Admins can view all RSVPs in the Admin panel (with filters and pagination). Organizers can view RSVPs for their own events. Users can see only their own RSVPs.",
  },
];

const Faq = ({
  heading = "Eventers — Common Questions",
  description = "Everything you need to know about creating events, RSVPs, and payments.",
  faqs = defaultFaqs,
}: Faq5Props) => {
  return (
    <section className="relative min-h-screen bg-black py-32">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 select-none",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
        )}
      />
      <div className="container mx-auto px-10 lg:px-16 relative z-10">
        <div className="text-center">
          <h1 className="mt-4 text-4xl font-semibold">{heading}</h1>
          <p className="mt-6 font-medium text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-xl">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-8 flex gap-4">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-secondary font-mono text-xs text-primary">
                {index + 1}
              </span>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{faq.question}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Faq };
