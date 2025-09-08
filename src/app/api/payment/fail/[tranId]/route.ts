import prisma from "@/lib/prisma";
import { PaymentStatus, RSVPStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * FAIL PAYMENT
 * Mark payment failed and (optionally) set RSVP status back to pending/cancelled semantics.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tranId: string } }
) {
  const { tranId } = params;

  const payment = await prisma.payment
    .update({
      where: { tranId },
      data: { status: PaymentStatus.FAILED },
      select: { rsvpId: true },
    })
    .catch(() => null);

  if (payment?.rsvpId) {
    await prisma.rSVP
      .update({
        where: { id: payment.rsvpId },
        data: { status: RSVPStatus.PENDING, paid: false },
      })
      .catch(() => {});
  }

  return NextResponse.json({ success: true, message: "Payment Failed" });
}
