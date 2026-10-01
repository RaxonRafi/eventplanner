import prisma from "@/lib/prisma";
import axios from "axios";

// Support both naming styles to avoid .env mismatches
const MODE = process.env.SSLCZ_MODE || process.env.SSL_MODE || "sandbox";
const SSL_BASE =
  MODE === "live"
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";

const STORE_ID = process.env.SSL_STORE_ID;
const STORE_PASS = process.env.SSL_STORE_PASS;

const IPN_URL = process.env.SSL_IPN_URL || "";

function toTwoDecimals(n: number) {
  return (Math.round(n * 100) / 100).toFixed(2); // "199.00"
}

export interface ISSLCommerz {
  amount: number; // BDT, e.g. 199.00 (NOT paisa)
  transactionId: string;
  name: string;
  email: string;
  /** Public origin of this app, e.g. https://ureventers.vercel.app — gateway callbacks are built from it */
  callbackOrigin: string;
}

export const SSLService = {
  /**
   * Initialize a payment session and return the gateway page URL.
   * NOTE: Your DB should already have Payment row with tranId, status=UNPAID.
   */
  async sslPaymentInit(payload: ISSLCommerz) {
    if (!STORE_ID || !STORE_PASS) {
      throw new Error("Missing SSLCOMMERZ credentials (STORE_ID / STORE_PASS)");
    }

    const tranId = encodeURIComponent(payload.transactionId);
    const api = `${payload.callbackOrigin}/api/payment`;

    // Build x-www-form-urlencoded body
    const form = new URLSearchParams({
      store_id: STORE_ID,
      store_passwd: STORE_PASS,
      total_amount: toTwoDecimals(payload.amount), // "199.00"
      currency: "BDT",
      tran_id: payload.transactionId,

      success_url: `${api}/success?tran_id=${tranId}`,
      fail_url: `${api}/fail/${tranId}`,
      cancel_url: `${api}/cancel/${tranId}`,
      ...(IPN_URL && !IPN_URL.includes("localhost") ? { ipn_url: IPN_URL } : {}),

      shipping_method: "NO",
      product_name: "Event Ticket",
      product_category: "Service",
      product_profile: "general",

      cus_name: payload.name || "Customer",
      cus_email: payload.email,
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: "01700000000",
    });

    // Always use gateway base, not a custom env URL.
    // v3 was retired: it now returns an HTML notice page instead of JSON.
    const url = `${SSL_BASE}/gwprocess/v4/api.php`;

    const res = await axios.post(url, form.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 15000,
    });

    const data = res.data || {};
    if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
      const reason =
        data.failedreason ||
        (typeof data === "string" ? "Unexpected non-JSON response" : "Invalid Information");
      throw new Error(`SSLC init error: ${reason}`);
    }

    return { GatewayPageURL: data.GatewayPageURL as string, raw: data };
  },

  /**
   * Validate a payment using val_id + tran_id and update DB:
   *  - Payment.status -> PAID on success (FAILED otherwise)
   *  - RSVP.status -> CONFIRMED, paid=true on success
   *
   * `valId` and `tranId` are read from IPN/return payload.
   */
  async validatePayment({ valId, tranId }: { valId: string; tranId: string }) {
    if (!STORE_ID || !STORE_PASS) {
      throw new Error("Missing SSLCOMMERZ credentials");
    }

    // The browser callback and the IPN both land here — the second one is a no-op
    const existing = await prisma.payment.findUnique({
      where: { tranId },
      select: { status: true },
    });
    if (existing?.status === "PAID")
      return { ok: true as const, newlyPaid: false, vData: null };

    const validateURL = `${SSL_BASE}/validator/api/validationserverAPI.php`;
    const url = `${validateURL}?val_id=${encodeURIComponent(
      valId
    )}&store_id=${encodeURIComponent(
      STORE_ID
    )}&store_passwd=${encodeURIComponent(STORE_PASS)}&format=json&v=1`;

    const res = await axios.get(url, { timeout: 15000 });
    const vData = res.data || {};

    const payment = await prisma.payment.findUnique({
      where: { tranId },
      select: { amount: true, currency: true },
    });

    // The val_id must belong to this transaction and cover the full amount
    const isOK =
      (vData.status === "VALID" || vData.status === "VALIDATED") &&
      payment != null &&
      vData.tran_id === tranId &&
      vData.currency_type === payment.currency &&
      Math.round(Number(vData.currency_amount) * 100) === payment.amount;

    if (!isOK) {
      await prisma.payment
        .updateMany({
          where: { tranId, status: { not: "PAID" } },
          data: {
            status: "FAILED",
            paymentGatewayData: JSON.stringify(vData),
          },
        })
        .catch(() => {});
      return { ok: false as const, newlyPaid: false, vData };
    }

    // Mark PAID and confirm RSVP in one transaction. The conditional update makes the
    // transition atomic: if the browser callback and the IPN race, only one sees newlyPaid.
    const newlyPaid = await prisma.$transaction(async (tx) => {
      const { count } = await tx.payment.updateMany({
        where: { tranId, status: { not: "PAID" } },
        data: {
          status: "PAID",
          paymentGatewayData: JSON.stringify(vData),
        },
      });
      if (count === 0) return false;

      const payment = await tx.payment.findUniqueOrThrow({
        where: { tranId },
        select: { rsvpId: true },
      });
      await tx.rSVP.update({
        where: { id: payment.rsvpId },
        data: { status: "CONFIRMED", paid: true },
      });
      return true;
    });

    return { ok: true as const, newlyPaid, vData };
  },
};
