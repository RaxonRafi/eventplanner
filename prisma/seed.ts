import {
  EventStatus,
  PaymentStatus,
  PrismaClient,
  Role,
  RSVPStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "Demo@123";

const ORGANIZERS = [
  { name: "Sarah Mitchell", email: "organizer1@demo.com" },
  { name: "James Chen", email: "organizer2@demo.com" },
] as const;

const USERS = [
  { name: "Emma Wilson", email: "user1@demo.com" },
  { name: "Liam Johnson", email: "user2@demo.com" },
  { name: "Olivia Brown", email: "user3@demo.com" },
  { name: "Noah Davis", email: "user4@demo.com" },
  { name: "Ava Martinez", email: "user5@demo.com" },
  { name: "Ethan Garcia", email: "user6@demo.com" },
  { name: "Sophia Lee", email: "user7@demo.com" },
  { name: "Mason Taylor", email: "user8@demo.com" },
] as const;

type DemoEvent = {
  title: string;
  description: string;
  location: string;
  capacity: number;
  bannerImage: string;
  daysFromNow: number;
  packages: { name: string; price: number }[];
  rsvps: { userEmail: string; status: RSVPStatus; paid: boolean }[];
};

const DEMO_EVENTS: { organizerEmail: string; events: DemoEvent[] }[] = [
  {
    organizerEmail: ORGANIZERS[0].email,
    events: [
      {
        title: "Tech Summit 2026",
        description:
          "Join industry leaders for a full-day conference on cloud, AI, and the future of software engineering.",
        location: "Convention Center, San Francisco",
        capacity: 500,
        bannerImage: "/images/about-1.jpg",
        daysFromNow: 30,
        packages: [
          { name: "General Admission", price: 99 },
          { name: "VIP Pass", price: 249 },
        ],
        rsvps: [
          { userEmail: USERS[0].email, status: RSVPStatus.CONFIRMED, paid: true },
          { userEmail: USERS[1].email, status: RSVPStatus.CONFIRMED, paid: true },
          { userEmail: USERS[2].email, status: RSVPStatus.CONFIRMED, paid: true },
        ],
      },
      {
        title: "Startup Pitch Night",
        description:
          "Watch ten early-stage founders pitch to angel investors. Networking drinks included after the show.",
        location: "Innovation Hub, Austin",
        capacity: 150,
        bannerImage: "/images/about-2.jpg",
        daysFromNow: 14,
        packages: [{ name: "Standard Ticket", price: 35 }],
        rsvps: [
          { userEmail: USERS[3].email, status: RSVPStatus.CONFIRMED, paid: true },
          { userEmail: USERS[4].email, status: RSVPStatus.CONFIRMED, paid: true },
        ],
      },
      {
        title: "AI Workshop Series",
        description:
          "Hands-on sessions covering LLMs, RAG pipelines, and deploying AI features in production apps.",
        location: "Tech Campus, Seattle",
        capacity: 80,
        bannerImage: "/images/clients/client1.jpg",
        daysFromNow: 21,
        packages: [
          { name: "Workshop Pass", price: 149 },
          { name: "Team Bundle (3 seats)", price: 399 },
        ],
        rsvps: [
          { userEmail: USERS[5].email, status: RSVPStatus.PENDING, paid: false },
          { userEmail: USERS[6].email, status: RSVPStatus.PENDING, paid: false },
        ],
      },
      {
        title: "Digital Marketing Expo",
        description:
          "Explore the latest in SEO, paid ads, and content strategy with workshops from top marketing agencies.",
        location: "Expo Hall, Chicago",
        capacity: 300,
        bannerImage: "/images/clients/client2.jpg",
        daysFromNow: 45,
        packages: [{ name: "Expo Entry", price: 59 }],
        rsvps: [
          { userEmail: USERS[7].email, status: RSVPStatus.CONFIRMED, paid: true },
        ],
      },
    ],
  },
  {
    organizerEmail: ORGANIZERS[1].email,
    events: [
      {
        title: "Jazz & Wine Evening",
        description:
          "An elegant night of live jazz performances paired with curated wines from local vineyards.",
        location: "Riverside Terrace, New Orleans",
        capacity: 120,
        bannerImage: "/images/about-3.jpg",
        daysFromNow: 10,
        packages: [
          { name: "General Seating", price: 75 },
          { name: "Front Row", price: 120 },
        ],
        rsvps: [
          { userEmail: USERS[0].email, status: RSVPStatus.CONFIRMED, paid: true },
          { userEmail: USERS[3].email, status: RSVPStatus.CONFIRMED, paid: true },
        ],
      },
      {
        title: "Food Festival Downtown",
        description:
          "Sample dishes from twenty local chefs, live cooking demos, and a street food market all weekend long.",
        location: "Main Street Plaza, Portland",
        capacity: 1000,
        bannerImage: "/images/clients/client3.jpg",
        daysFromNow: 18,
        packages: [{ name: "Weekend Pass", price: 45 }],
        rsvps: [
          { userEmail: USERS[1].email, status: RSVPStatus.CONFIRMED, paid: true },
          { userEmail: USERS[4].email, status: RSVPStatus.CONFIRMED, paid: true },
          { userEmail: USERS[5].email, status: RSVPStatus.CONFIRMED, paid: true },
        ],
      },
      {
        title: "Charity Run 2026",
        description:
          "5K and 10K routes through the city park. All proceeds support local youth sports programs.",
        location: "Central Park, Denver",
        capacity: 400,
        bannerImage: "/images/clients/client4.jpg",
        daysFromNow: 25,
        packages: [
          { name: "5K Entry", price: 30 },
          { name: "10K Entry", price: 45 },
        ],
        rsvps: [
          { userEmail: USERS[2].email, status: RSVPStatus.PENDING, paid: false },
          { userEmail: USERS[6].email, status: RSVPStatus.PENDING, paid: false },
          { userEmail: USERS[7].email, status: RSVPStatus.CONFIRMED, paid: true },
        ],
      },
      {
        title: "Photography Masterclass",
        description:
          "Learn portrait lighting, composition, and post-processing from an award-winning photographer.",
        location: "Studio 42, Brooklyn",
        capacity: 30,
        bannerImage: "/images/clients/client5.jpg",
        daysFromNow: 35,
        packages: [{ name: "Masterclass Seat", price: 199 }],
        rsvps: [
          { userEmail: USERS[0].email, status: RSVPStatus.CONFIRMED, paid: true },
          { userEmail: USERS[1].email, status: RSVPStatus.CONFIRMED, paid: true },
          { userEmail: USERS[2].email, status: RSVPStatus.CONFIRMED, paid: true },
          { userEmail: USERS[3].email, status: RSVPStatus.CONFIRMED, paid: true },
        ],
      },
    ],
  },
];

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@eventplanner.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Admin",
      password: adminHash,
      role: Role.ADMIN,
    },
    create: {
      name: "Admin",
      email: adminEmail,
      password: adminHash,
      role: Role.ADMIN,
    },
  });

  console.log(`Seeded admin user: ${admin.email}`);
}

async function seedDemoUsers(hashedPassword: string) {
  const userMap = new Map<string, string>();

  for (const organizer of ORGANIZERS) {
    const user = await prisma.user.upsert({
      where: { email: organizer.email },
      update: {
        name: organizer.name,
        password: hashedPassword,
        role: Role.ORGANIZER,
      },
      create: {
        name: organizer.name,
        email: organizer.email,
        password: hashedPassword,
        role: Role.ORGANIZER,
      },
    });
    userMap.set(user.email, user.id);
  }

  for (const demoUser of USERS) {
    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        name: demoUser.name,
        password: hashedPassword,
        role: Role.USER,
      },
      create: {
        name: demoUser.name,
        email: demoUser.email,
        password: hashedPassword,
        role: Role.USER,
      },
    });
    userMap.set(user.email, user.id);
  }

  console.log(
    `Seeded ${ORGANIZERS.length} organizers and ${USERS.length} demo users (password: ${DEMO_PASSWORD})`
  );

  return userMap;
}

async function seedDemoEvents(userMap: Map<string, string>) {
  let eventCount = 0;
  let rsvpCount = 0;

  for (const group of DEMO_EVENTS) {
    const organizerId = userMap.get(group.organizerEmail);
    if (!organizerId) continue;

    for (const eventData of group.events) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + eventData.daysFromNow);
      eventDate.setHours(18, 0, 0, 0);

      let event = await prisma.event.findFirst({
        where: { title: eventData.title, organizerId },
        include: { packages: true },
      });

      if (!event) {
        event = await prisma.event.create({
          data: {
            title: eventData.title,
            description: eventData.description,
            date: eventDate,
            location: eventData.location,
            capacity: eventData.capacity,
            bannerImage: eventData.bannerImage,
            status: EventStatus.APPROVED,
            organizerId,
            packages: {
              create: eventData.packages.map((pkg) => ({
                name: pkg.name,
                price: pkg.price,
              })),
            },
          },
          include: { packages: true },
        });
        eventCount++;
      } else {
        event = await prisma.event.update({
          where: { id: event.id },
          data: {
            description: eventData.description,
            date: eventDate,
            location: eventData.location,
            capacity: eventData.capacity,
            bannerImage: eventData.bannerImage,
            status: EventStatus.APPROVED,
          },
          include: { packages: true },
        });
      }

      const defaultPackage = event.packages[0];
      if (!defaultPackage) continue;

      for (const rsvpData of eventData.rsvps) {
        const userId = userMap.get(rsvpData.userEmail);
        if (!userId) continue;

        const packageForRsvp =
          event.packages.find((p) => p.name === eventData.packages[0]?.name) ??
          defaultPackage;

        const rsvp = await prisma.rSVP.upsert({
          where: {
            userId_eventId: { userId, eventId: event.id },
          },
          update: {
            status: rsvpData.status,
            paid: rsvpData.paid,
            packageId: packageForRsvp.id,
          },
          create: {
            userId,
            eventId: event.id,
            packageId: packageForRsvp.id,
            status: rsvpData.status,
            paid: rsvpData.paid,
          },
        });

        if (rsvpData.paid) {
          const existingPayment = await prisma.payment.findFirst({
            where: { rsvpId: rsvp.id, status: PaymentStatus.PAID },
          });

          if (!existingPayment) {
            await prisma.payment.create({
              data: {
                rsvpId: rsvp.id,
                amount: Math.round(packageForRsvp.price * 100),
                currency: "BDT",
                status: PaymentStatus.PAID,
                tranId: `demo-${rsvp.id.slice(0, 8)}`,
              },
            });
          }
        }

        rsvpCount++;
      }
    }
  }

  console.log(`Seeded ${eventCount} new events and ${rsvpCount} RSVP assignments`);
}

async function main() {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  await seedAdmin();
  const userMap = await seedDemoUsers(hashedPassword);
  await seedDemoEvents(userMap);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
