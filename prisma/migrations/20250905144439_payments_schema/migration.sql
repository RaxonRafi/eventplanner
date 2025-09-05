/*
  Warnings:

  - A unique constraint covering the columns `[userId,eventId]` on the table `RSVP` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "rsvpId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "tranId" TEXT,
    "valId" TEXT,
    "cardIssuer" TEXT,
    "storeAmount" DOUBLE PRECISION,
    "bankTranId" TEXT,
    "errorReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_rsvpId_status_idx" ON "public"."Payment"("rsvpId", "status");

-- CreateIndex
CREATE INDEX "Payment_tranId_idx" ON "public"."Payment"("tranId");

-- CreateIndex
CREATE INDEX "RSVP_eventId_status_idx" ON "public"."RSVP"("eventId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RSVP_userId_eventId_key" ON "public"."RSVP"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "public"."RSVP"("id") ON DELETE CASCADE ON UPDATE CASCADE;
