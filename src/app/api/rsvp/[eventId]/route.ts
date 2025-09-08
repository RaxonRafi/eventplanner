import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  const { eventId } = params;
  // TODO: implement RSVP creation using eventId and request body
  return NextResponse.json({ ok: true, eventId });
}
