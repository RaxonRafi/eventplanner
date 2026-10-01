/* eslint-disable @typescript-eslint/no-explicit-any */
import { notifyPaymentConfirmed } from "@/services/notificationService";
import { SSLService } from "@/services/paymentService";
import { after, NextResponse } from "next/server";

// SSLCommerz POSTs the customer's browser here (form-encoded) after a successful payment.
// The payment is only marked PAID once val_id has been verified with the validation API.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const form = await req.formData().catch(() => null);
  const field = (k: string) => (form?.get(k) as string | null) || url.searchParams.get(k) || "";

  const tranId = field("tran_id");
  const valId = field("val_id");
  const redirect = (status: "success" | "fail") =>
    NextResponse.redirect(
      `${url.origin}/payment/${status}?tran_id=${encodeURIComponent(tranId)}`,
      303
    );

  if (!tranId || !valId) return redirect("fail");

  try {
    const result = await SSLService.validatePayment({ valId, tranId });
    // Notify/email once, after the response is sent (the other callback sees newlyPaid=false)
    if (result.newlyPaid) after(() => notifyPaymentConfirmed(tranId, url.origin));
    return redirect(result.ok ? "success" : "fail");
  } catch (e: any) {
    console.error("[payment/success]", e?.message, e?.stack);
    return redirect("fail");
  }
}
