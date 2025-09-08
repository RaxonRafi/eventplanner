-- DropForeignKey
ALTER TABLE "public"."RSVP" DROP CONSTRAINT "RSVP_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."RSVP" ADD CONSTRAINT "RSVP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
