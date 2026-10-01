
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
    question: "How do I book an event?",
    answer:
      "Open any event from Browse events, pick a ticket package and click Book now. You'll be taken to SSLCommerz to pay; once the payment succeeds your booking is confirmed instantly and a receipt is emailed to you.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "Payments are processed by SSLCommerz, which supports cards (Visa, Mastercard, Amex), mobile banking and internet banking.",
  },
  {
    question: "My payment failed or I cancelled it — what now?",
    answer:
      "You haven't been charged and your seat isn't confirmed. Just open the event again and book — you can retry as many times as you need.",
  },
  {
    question: "Where can I see my bookings?",
    answer:
      "Sign in and open Dashboard → My RSVPs. You'll also get a notification in the bell menu whenever a booking is confirmed.",
  },
  {
    question: "How do I create an event?",
    answer:
      "Register as an Organizer, then go to Dashboard → Create Event. Add the details, a banner image and one or more ticket packages. An admin reviews new events before they're published.",
  },
  {
    question: "Can I edit my event after publishing?",
    answer:
      "Yes. Organizers can edit their events from Dashboard → My Events at any time. Packages that already have bookings can be renamed or repriced but not removed, and capacity can't go below the seats already sold.",
  },
  {
    question: "How much does it cost to sell tickets?",
    answer:
      "Listing an event is free. A 20% platform fee is deducted from each booking — attendees pay the package price you set and you receive the remaining 80%.",
  },
  {
    question: "How is event capacity enforced?",
    answer:
      "Only confirmed (paid) bookings count toward capacity. Once an event is full, booking is closed automatically.",
  },
];

const Faq = ({
  heading = "Frequently asked questions",
  description = "Everything you need to know about booking, payments and hosting events.",
  faqs = defaultFaqs,
}: Faq5Props) => {
  return (
    <section className="relative py-16 md:py-20">
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
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
