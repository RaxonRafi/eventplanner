/* eslint-disable @typescript-eslint/no-explicit-any */
// import prisma from "@/lib/prisma";
import { SSLService } from "@/services/paymentService";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"
import { PaymentStatus, RSVPStatus } from "@prisma/client"



export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const tranId = url.searchParams.get("tran_id") || url.searchParams.get("transactionId") || ""
    const valId  = url.searchParams.get("val_id") || "" 

    if (!tranId) return NextResponse.json({ error: "Missing tran_id" }, { status: 400 })

    if (valId) {
      const result = await SSLService.validatePayment({ valId, tranId })
      if (!result.ok) return NextResponse.json({ ok: false, message: "Validation failed" }, { status: 400 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.update({
        where: { tranId },
        data: {
          status: PaymentStatus.PAID,
          ...(valId ? { paymentGatewayData: JSON.stringify({ valId }) } : {}),
        },
        select: { rsvpId: true },
      })

      const rsvp = await tx.rSVP.update({
        where: { id: p.rsvpId },
        data: { status: RSVPStatus.CONFIRMED, paid: true },
      })

      return { rsvpId: rsvp.id }
    })

    return NextResponse.json({ ok: true, rsvpId: updated.rsvpId })
  } catch (e: any) {
    console.error("[payment/success]", e?.message, e?.stack)
    // If payment not found by tranId, Prisma throws P2025
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Payment not found for this tran_id" }, { status: 404 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}



