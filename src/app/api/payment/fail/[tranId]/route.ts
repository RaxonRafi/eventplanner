import prisma from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * FAIL PAYMENT
 * SSLCommerz POSTs the customer's browser here when the payment fails.
 * The RSVP stays PENDING/unpaid so the user can retry from the event page.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tranId: string }> }
) {
  const { tranId } = await params;

  // Never downgrade a payment that has already been validated as PAID
  await prisma.payment
    .updateMany({
      where: { tranId, status: PaymentStatus.UNPAID },
      data: { status: PaymentStatus.FAILED },
    })
    .catch(() => {});

  return NextResponse.redirect(
    `${request.nextUrl.origin}/payment/fail?tran_id=${encodeURIComponent(tranId)}`,
    303
  );
}
