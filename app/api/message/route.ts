import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateFlightPlan } from "@/lib/flight";
import { checkRateLimit } from "@/lib/rate-limit";
import { randomUUID } from "crypto";

// POST /api/message — dispatch a carrier
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many dispatches. Retry in ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const body = await req.json();
  const { from_loft_id, to_loft_id, content } = body;

  if (!from_loft_id || !to_loft_id || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (from_loft_id === to_loft_id) {
    return NextResponse.json({ error: "Cannot dispatch carrier to own loft" }, { status: 400 });
  }
  if (content.trim().length > 2000) {
    return NextResponse.json({ error: "Datagram exceeds 2000 characters" }, { status: 400 });
  }

  const fromLoft = db.lofts.findById(from_loft_id);
  const toLoft = db.lofts.findById(to_loft_id);

  if (!fromLoft) return NextResponse.json({ error: "Origin loft not found" }, { status: 404 });
  if (!toLoft) return NextResponse.json({ error: "Destination loft not found" }, { status: 404 });

  const plan = await calculateFlightPlan(
    fromLoft.lat, fromLoft.lon,
    toLoft.lat, toLoft.lon
  );

  const now = Date.now();
  const msg = db.messages.create({
    id: randomUUID(),
    from_loft_id,
    to_loft_id,
    content: content.trim(),
    status: plan.nxpigeon ? "nxpigeon" : "in_flight",
    dispatched_at: now,
    eta_at: now + plan.etaMs,
    distance_km: plan.distanceKm,
    wind_ms: plan.meanWindMs,
    failure_reason: plan.failureReason,
  });

  return NextResponse.json({ message: msg, plan }, { status: 201 });
}

// GET /api/message?loft_id= — all messages for a loft
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const loftId = searchParams.get("loft_id");

  if (!loftId) {
    return NextResponse.json({ error: "Provide loft_id" }, { status: 400 });
  }

  const loft = db.lofts.findById(loftId);
  if (!loft) return NextResponse.json({ error: "Loft not found" }, { status: 404 });

  // Settle any arrived messages before returning
  db.messages.settleArrived();

  const messages = db.messages.forLoft(loftId);
  return NextResponse.json({ messages });
}
