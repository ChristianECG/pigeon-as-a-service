import { describe, it, expect } from "vitest";
import { greatCircleDistance, greatCircleInterpolate, bearing } from "../lib/geo";

describe("greatCircleDistance", () => {
  it("returns 0 for the same point", () => {
    expect(greatCircleDistance(0, 0, 0, 0)).toBeCloseTo(0);
  });

  it("returns ~305 km from Bergen to Oslo", () => {
    const d = greatCircleDistance(60.39, 5.32, 59.91, 10.75);
    expect(d).toBeGreaterThan(290);
    expect(d).toBeLessThan(320);
  });

  it("returns half Earth circumference for antipodal equatorial points", () => {
    const d = greatCircleDistance(0, 0, 0, 180);
    expect(d).toBeCloseTo(Math.PI * 6371, -1);
  });

  it("is symmetric", () => {
    const a = greatCircleDistance(40.71, -74.0, 51.51, -0.13);
    const b = greatCircleDistance(51.51, -0.13, 40.71, -74.0);
    expect(a).toBeCloseTo(b, 5);
  });
});

describe("greatCircleInterpolate", () => {
  it("returns origin at t=0", () => {
    const [lat, lon] = greatCircleInterpolate(10, 20, 30, 40, 0);
    expect(lat).toBeCloseTo(10, 4);
    expect(lon).toBeCloseTo(20, 4);
  });

  it("returns destination at t=1", () => {
    const [lat, lon] = greatCircleInterpolate(10, 20, 30, 40, 1);
    expect(lat).toBeCloseTo(30, 4);
    expect(lon).toBeCloseTo(40, 4);
  });

  it("returns same point when origin equals destination", () => {
    const [lat, lon] = greatCircleInterpolate(10, 20, 10, 20, 0.5);
    expect(lat).toBeCloseTo(10, 4);
    expect(lon).toBeCloseTo(20, 4);
  });

  it("returns a valid coordinate at t=0.5", () => {
    const [lat, lon] = greatCircleInterpolate(0, 0, 0, 90, 0.5);
    expect(lat).toBeGreaterThanOrEqual(-90);
    expect(lat).toBeLessThanOrEqual(90);
    expect(lon).toBeGreaterThan(0);
    expect(lon).toBeLessThan(90);
  });
});

describe("bearing", () => {
  it("returns ~0° heading due north", () => {
    expect(bearing(0, 0, 10, 0)).toBeCloseTo(0, 0);
  });

  it("returns ~90° heading due east", () => {
    expect(bearing(0, 0, 0, 10)).toBeCloseTo(90, 0);
  });

  it("returns ~180° heading due south", () => {
    expect(bearing(10, 0, 0, 0)).toBeCloseTo(180, 0);
  });

  it("returns ~270° heading due west", () => {
    expect(bearing(0, 10, 0, 0)).toBeCloseTo(270, 0);
  });
});
