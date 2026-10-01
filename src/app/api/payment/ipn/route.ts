/* eslint-disable @typescript-eslint/no-explicit-any */
import { SSLService } from "@/services/paymentService";
import { NextResponse } from "next/server";

/**
 * SSLCommerz IPN (Instant Payment Notification) — server-to-server.
 * Configure in the SSLCommerz merchant panel as: https://<your-domain>/api/payment/ipn
 * Confirms the booking even if the customer closes the tab before being redirected back.
 * Like the success callback, nothing is trusted until val_id is verified with the validation API.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const tranId = (form?.get("tran_id") as string | null) ?? "";
  const valId = (form?.get("val_id") as string | null) ?? "";
  const status = (form?.get("status") as string | null) ?? "";

  if (!tranId) return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
  // FAILED / CANCELLED notifications carry no val_id; the browser callbacks already record those
  if (status !== "VALID" || !valId) return NextResponse.json({ ok: true, ignored: status });

  try {
    const result = await SSLService.validatePayment({ valId, tranId });
    return NextResponse.json({ ok: result.ok });
  } catch (e: any) {
    console.error("[payment/ipn]", e?.message);
    // Non-2xx makes SSLCommerz retry the notification
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
