import { splitAmount, formatBDT } from "@/lib/fees";
import { sendMail } from "@/lib/mailer";
import prisma from "@/lib/prisma";
import { publish } from "@/lib/realtime";
import { NotificationType, Role } from "@prisma/client";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Fan out a confirmed payment: notify the buyer, the event's organizer and every admin
 * (stored + pushed over WebSocket), and email the buyer a receipt.
 * Never throws — a notification problem must not affect the payment itself.
 */
export async function notifyPaymentConfirmed(tranId: string, origin: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { tranId },
      select: {
        amount: true,
        rsvp: {
          select: {
            user: { select: { id: true, name: true, email: true } },
            package: { select: { name: true } },
            event: {
              select: { id: true, title: true, date: true, location: true, organizerId: true },
            },
          },
        },
      },
    });
    if (!payment) return;

    const { user: buyer, event, package: pkg } = payment.rsvp;
    const { platformFee, organizerAmount } = splitAmount(payment.amount);
    const amount = formatBDT(payment.amount);
    const buyerName = buyer.name || buyer.email;
    const pkgLabel = pkg ? ` (${pkg.name})` : "";

    const admins = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: { id: true },
    });

    const drafts = [
      {
        userId: buyer.id,
        type: NotificationType.BOOKING_CONFIRMED,
        title: "Booking confirmed",
        body: `Your payment of ${amount} for ${event.title}${pkgLabel} is confirmed.`,
        link: `/events/${event.id}`,
      },
      // An admin who organizes the event gets the organizer notification only
      ...(event.organizerId !== buyer.id
        ? [
            {
              userId: event.organizerId,
              type: NotificationType.NEW_BOOKING,
              title: "New booking",
              body: `${buyerName} booked ${event.title}${pkgLabel} — you earn ${formatBDT(organizerAmount)}.`,
              link: "/dashboard/payments",
            },
          ]
        : []),
      ...admins
        .filter((a) => a.id !== event.organizerId)
        .map((a) => ({
          userId: a.id,
          type: NotificationType.PAYMENT_RECEIVED,
          title: "Payment received",
          body: `${amount} from ${buyerName} for ${event.title} — platform fee ${formatBDT(platformFee)}.`,
          link: "/dashboard/payments",
        })),
    ];

    const created = await prisma.notification.createManyAndReturn({ data: drafts });
    await Promise.allSettled(
      created.map((n) => publish(n.userId, { kind: "notification", notification: n }))
    );

    const when = event.date.toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Dhaka",
    });
    await sendMail(
      buyer.email,
      `Booking confirmed: ${event.title}`,
      `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#111">
        <h2 style="margin-bottom:4px">You're going to ${escapeHtml(event.title)}! 🎉</h2>
        <p style="color:#555">Hi ${escapeHtml(buyerName)}, your payment was successful and your booking is confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:6px 0;color:#555">Event</td><td style="padding:6px 0"><b>${escapeHtml(event.title)}</b></td></tr>
          ${pkg ? `<tr><td style="padding:6px 0;color:#555">Package</td><td style="padding:6px 0">${escapeHtml(pkg.name)}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#555">When</td><td style="padding:6px 0">${escapeHtml(when)}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Where</td><td style="padding:6px 0">${escapeHtml(event.location)}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Amount paid</td><td style="padding:6px 0"><b>${amount}</b></td></tr>
          <tr><td style="padding:6px 0;color:#555">Transaction</td><td style="padding:6px 0;font-family:monospace;font-size:12px">${escapeHtml(tranId)}</td></tr>
        </table>
        <a href="${origin}/events/${event.id}" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">View event</a>
        <p style="color:#888;font-size:12px;margin-top:24px">Eventers · This is your payment receipt.</p>
      </div>`,
      `Booking confirmed: ${event.title}${pkgLabel}\nWhen: ${when}\nWhere: ${event.location}\nAmount paid: ${amount}\nTransaction: ${tranId}\n${origin}/events/${event.id}`
    );
  } catch (e) {
    console.error("[notifyPaymentConfirmed]", e instanceof Error ? e.message : e);
  }
}
