/** Share of every booking the platform keeps; the organizer receives the rest. */
export const PLATFORM_FEE_RATE = 0.2;

/** Split an amount (in paisa) into platform fee and organizer payout. */
export function splitAmount(amount: number) {
  const platformFee = Math.round(amount * PLATFORM_FEE_RATE);
  return { platformFee, organizerAmount: amount - platformFee };
}

/** Format an amount in paisa as BDT, e.g. 50000 -> "BDT 500.00". */
export function formatBDT(amountPaisa: number) {
  return `BDT ${(amountPaisa / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
