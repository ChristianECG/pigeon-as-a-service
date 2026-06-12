import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { randomUUID } from "crypto";

// POST /api/loft — create a new loft
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed, retryAfter } = checkRateLimit("loft:" + ip, 5, 3_600_000);
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many loft registrations. Retry in ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const body = await req.json();
  const { lat, lon, heading = 0, alt_band = 1 } = body;

  if (
    typeof lat !== "number" ||
    typeof lon !== "number" ||
    lat < -90 || lat > 90 ||
    lon < -180 || lon > 180
  ) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const existing = db.lofts.findByCoords(lat, lon);
  if (existing) {
    return NextResponse.json(existing);
  }

  const loft = db.lofts.create({
    id: randomUUID(),
    lat,
    lon,
    heading: Math.round(heading) % 360,
    alt_band: [0, 1, 2, 3].includes(alt_band) ? alt_band : 1,
  });

  return NextResponse.json(loft, { status: 201 });
}

// GET /api/loft?id= or /api/loft?lat=&lon= or no params for all
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");

  if (id) {
    const loft = db.lofts.findById(id);
    if (!loft) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(loft);
  }

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (lat && lon) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (isNaN(latNum) || isNaN(lonNum)) {
      return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 });
    }
    const loft = db.lofts.findByCoords(latNum, lonNum);
    if (!loft) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(loft);
  }

  // No params: return all lofts
  const allLofts = db.lofts.all();
  return NextResponse.json({ lofts: allLofts });
}
