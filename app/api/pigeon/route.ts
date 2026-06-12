import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentPosition } from "@/lib/flight";

// GET /api/pigeon?id= — live position of a carrier
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Provide id" }, { status: 400 });

  const msg = db.messages.findById(id);
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  db.messages.settleArrived();
  const fresh = db.messages.findById(id)!;

  if (fresh.status !== "in_flight") {
    return NextResponse.json({ message: fresh, position: null });
  }

  const fromLoft = db.lofts.findById(fresh.from_loft_id)!;
  const toLoft = db.lofts.findById(fresh.to_loft_id)!;

  const position = currentPosition(
    fromLoft.lat, fromLoft.lon,
    toLoft.lat, toLoft.lon,
    fresh.dispatched_at,
    fresh.eta_at
  );

  return NextResponse.json({ message: fresh, position });
}
