import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { currentPosition } from "@/lib/flight";

export const dynamic = "force-dynamic";

// GET /api/sse?loft_id= — SSE stream of pigeon positions for a loft
// Emits a position event every 30 seconds for each in-flight carrier.
export async function GET(req: NextRequest) {
  const loftId = req.nextUrl.searchParams.get("loft_id");
  if (!loftId) {
    return new Response("Provide loft_id", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function emit(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      let interval: ReturnType<typeof setInterval>;

      function tick() {
        try {
          db.messages.settleArrived();
          const messages = db.messages.forLoft(loftId!);

          const inFlight = messages.filter((m) => m.status === "in_flight");
          const positions = inFlight.map((msg) => {
            const from = db.lofts.findById(msg.from_loft_id)!;
            const to = db.lofts.findById(msg.to_loft_id)!;
            return {
              messageId: msg.id,
              ...currentPosition(
                from.lat, from.lon,
                to.lat, to.lon,
                msg.dispatched_at,
                msg.eta_at
              ),
              etaAt: msg.eta_at,
            };
          });

          const loftIds = [...new Set(messages.flatMap((m) => [m.from_loft_id, m.to_loft_id]))];
          const loftCoordsMap: Record<string, { lat: number; lon: number }> = {};
          loftIds.forEach((id) => {
            const l = db.lofts.findById(id);
            if (l) loftCoordsMap[id] = { lat: l.lat, lon: l.lon };
          });

          emit("positions", positions);
          emit("lofts", loftCoordsMap);
          emit("messages", messages);
        } catch {
          // Client disconnected
          clearInterval(interval);
          controller.close();
        }
      }

      tick();
      interval = setInterval(tick, 30_000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
