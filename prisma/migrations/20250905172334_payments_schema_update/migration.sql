/*
  Warnings:

  - The values [PENDING,SUCCESS] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bankTranId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `cardIssuer` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `errorReason` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `storeAmount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `valId` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PaymentStatus_new" AS ENUM ('UNPAID', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');
ALTER TABLE "public"."Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Payment" ALTER COLUMN "status" TYPE "public"."PaymentStatus_new" USING ("status"::text::"public"."PaymentStatus_new");
ALTER TYPE "public"."PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "public"."PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
ALTER TABLE "public"."Payment" ALTER COLUMN "status" SET DEFAULT 'UNPAID';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "bankTranId",
DROP COLUMN "cardIssuer",
DROP COLUMN "errorReason",
DROP COLUMN "method",
DROP COLUMN "storeAmount",
DROP COLUMN "valId",
ALTER COLUMN "status" SET DEFAULT 'UNPAID';
