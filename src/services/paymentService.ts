/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from "@/lib/prisma"
import axios from "axios"

// Support both naming styles to avoid .env mismatches
const MODE = process.env.SSLCZ_MODE || process.env.SSL_MODE || "sandbox"
const SSL_BASE =
  MODE === "live"
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com"

const STORE_ID   = process.env.SSL_STORE_ID
const STORE_PASS =  process.env.SSL_STORE_PASS

const SUCCESS_BACKEND_URL = process.env.SSL_SUCCESS_BACKEND_URL || "http://localhost:3000/api/payments/return"
const FAIL_BACKEND_URL    = process.env.SSL_FAIL_BACKEND_URL    || "http://localhost:3000/api/payments/return"
const CANCEL_BACKEND_URL  = process.env.SSL_CANCEL_BACKEND_URL  || "http://localhost:3000/api/payments/return"
const IPN_URL             = process.env.SSL_IPN_URL || ""

function toTwoDecimals(n: number) {
  return (Math.round(n * 100) / 100).toFixed(2) // "199.00"
}

export interface ISSLCommerz {
  amount: number // BDT, e.g. 199.00 (NOT paisa)
  transactionId: string
  name: string
  email: string
}

export const SSLService = {
  /**
   * Initialize a payment session and return the gateway page URL.
   * NOTE: Your DB should already have Payment row with tranId, status=UNPAID.
   */
  async sslPaymentInit(payload: ISSLCommerz) {
    if (!STORE_ID || !STORE_PASS) {
      throw new Error("Missing SSLCOMMERZ credentials (STORE_ID / STORE_PASS)")
    }

    // Build x-www-form-urlencoded body
    const form = new URLSearchParams({
      store_id: STORE_ID,
      store_passwd: STORE_PASS,
      total_amount: toTwoDecimals(payload.amount), // "199.00"
      currency: "BDT",
      tran_id: payload.transactionId,

      success_url: `${SUCCESS_BACKEND_URL}?tran_id=${encodeURIComponent(payload.transactionId)}`,
      fail_url:    `${FAIL_BACKEND_URL}?tran_id=${encodeURIComponent(payload.transactionId)}`,
      cancel_url:  `${CANCEL_BACKEND_URL}?tran_id=${encodeURIComponent(payload.transactionId)}`,
      ...(IPN_URL ? { ipn_url: IPN_URL } : {}),

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
    })

    // Always use gateway base, not a custom env URL
    const url = `${SSL_BASE}/gwprocess/v3/api.php`

    const res = await axios.post(url, form.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      // timeout: 10000,
    })

    const data = res.data || {}
    if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
      const reason = data.failedreason || "Invalid Information"
      throw new Error(`SSLC init error: ${reason}`)
    }

    return { GatewayPageURL: data.GatewayPageURL as string, raw: data }
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
      throw new Error("Missing SSLCOMMERZ credentials")
    }

    const validateURL = `${SSL_BASE}/validator/api/validationserverAPI.php`
    const url = `${validateURL}?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(
      STORE_ID
    )}&store_passwd=${encodeURIComponent(STORE_PASS)}&format=json&v=1`

    const res = await axios.get(url /* , { timeout: 10000 } */)
    const vData = res.data || {}

    const isOK = vData.status === "VALID" || vData.status === "VALIDATED"

    if (!isOK) {
      await prisma.payment.update({
        where: { tranId },
        data: {
          status: "FAILED",
          paymentGatewayData: JSON.stringify(vData),
        },
      }).catch(() => {})
      return { ok: false as const, vData }
    }

    // Mark PAID and confirm RSVP in one transaction
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { tranId },
        data: {
          status: "PAID",
          paymentGatewayData: JSON.stringify(vData),
        },
        select: { rsvpId: true },
      })

      await tx.rSVP.update({
        where: { id: payment.rsvpId },
        data: { status: "CONFIRMED", paid: true },
      })
    })

    return { ok: true as const, vData }
  },
}
