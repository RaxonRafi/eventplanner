import prisma from "@/lib/prisma"
import { PaymentStatus, RSVPStatus } from "@prisma/client"

/**
 * FAIL PAYMENT
 * Mark payment failed and (optionally) set RSVP status back to pending/cancelled semantics.
 */
export async function POST(params: { tranId: string }) {
  const payment = await prisma.payment.update({
    where: { tranId: params.tranId },
    data: { status: PaymentStatus.FAILED },
    select: { rsvpId: true },
  }).catch(() => null)

  if (payment?.rsvpId) {
    // Keep RSVP PENDING, or set a specific failed state if you add it.
    await prisma.rSVP.update({
      where: { id: payment.rsvpId },
      data: { status: RSVPStatus.PENDING, paid: false },
    }).catch(() => {})
  }
  return { success: false, message: "Payment Failed" }
}