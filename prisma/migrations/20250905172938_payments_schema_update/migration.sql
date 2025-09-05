/*
  Warnings:

  - A unique constraint covering the columns `[tranId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Payment_tranId_key" ON "public"."Payment"("tranId");
