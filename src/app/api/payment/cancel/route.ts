import prisma from "@/lib/prisma"
import { PaymentStatus, RSVPStatus } from "@prisma/client"

/**
 * CANCEL PAYMENT
 * Mark payment cancelled; keep RSVP pending so the user can try again.
 */
export async function POST(params: { tranId: string }) {
  const payment = await prisma.payment.update({
    where: { tranId: params.tranId },
    data: { status: PaymentStatus.CANCELLED },
    select: { rsvpId: true },
  }).catch(() => null)

  if (payment?.rsvpId) {
    await prisma.rSVP.update({
      where: { id: payment.rsvpId },
      data: { status: RSVPStatus.PENDING, paid: false },
    }).catch(() => {})
  }
  return { success: false, message: "Payment Cancelled" }
}