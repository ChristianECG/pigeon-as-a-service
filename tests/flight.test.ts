import { describe, it, expect } from "vitest";
import { currentPosition, NXPIGEON_RATE } from "../lib/flight";

describe("currentPosition", () => {
  it("returns progress=0 and origin coords at dispatch time", () => {
    const now = Date.now();
    const pos = currentPosition(0, 0, 10, 10, now, now + 3_600_000);
    expect(pos.progress).toBe(0);
    expect(pos.lat).toBeCloseTo(0, 4);
    expect(pos.lon).toBeCloseTo(0, 4);
  });

  it("returns progress=1 and destination coords after ETA", () => {
    const now = Date.now();
    const pos = currentPosition(0, 0, 10, 10, now - 7_200_000, now - 3_600_000);
    expect(pos.progress).toBe(1);
    expect(pos.lat).toBeCloseTo(10, 4);
    expect(pos.lon).toBeCloseTo(10, 4);
  });

  it("clamps progress to 0 before dispatch", () => {
    const now = Date.now();
    const pos = currentPosition(0, 0, 10, 10, now + 10_000, now + 20_000);
    expect(pos.progress).toBe(0);
  });

  it("clamps progress to 1 past ETA", () => {
    const now = Date.now();
    const pos = currentPosition(0, 0, 10, 10, now - 20_000, now - 10_000);
    expect(pos.progress).toBe(1);
  });

  it("returns a position between origin and destination at 50% progress", () => {
    const now = Date.now();
    const half = 3_600_000;
    const pos = currentPosition(0, 0, 0, 90, now - half, now + half);
    expect(pos.progress).toBeCloseTo(0.5, 2);
    expect(pos.lon).toBeGreaterThan(0);
    expect(pos.lon).toBeLessThan(90);
  });

  it("interpolates lat and lon continuously between origin and destination", () => {
    const now = Date.now();
    const total = 10_000;
    const halfway = now - total / 2;
    const eta = now + total / 2;

    const pos = currentPosition(10, 20, 30, 60, halfway, eta);
    expect(pos.lat).toBeGreaterThan(10);
    expect(pos.lat).toBeLessThan(30);
    expect(pos.lon).toBeGreaterThan(20);
    expect(pos.lon).toBeLessThan(60);
  });
});

describe("NXPIGEON_RATE", () => {
  it("is a probability between 0 and 1", () => {
    expect(NXPIGEON_RATE).toBeGreaterThan(0);
    expect(NXPIGEON_RATE).toBeLessThanOrEqual(1);
  });
});
