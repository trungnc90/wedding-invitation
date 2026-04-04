import { describe, it, expect } from "vitest";
import { computeTimeRemaining } from "./CountdownTimer";

describe("computeTimeRemaining", () => {
  it("returns zeros when target date is in the past", () => {
    const past = new Date("2020-01-01T00:00:00Z");
    const now = new Date("2024-06-01T00:00:00Z");
    const result = computeTimeRemaining(past, now);
    expect(result).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it("returns zeros when target date equals now", () => {
    const date = new Date("2024-06-01T12:00:00Z");
    const result = computeTimeRemaining(date, date);
    expect(result).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it("computes exactly 1 day remaining", () => {
    const now = new Date("2024-06-01T00:00:00Z");
    const target = new Date("2024-06-02T00:00:00Z");
    const result = computeTimeRemaining(target, now);
    expect(result).toEqual({ days: 1, hours: 0, minutes: 0, seconds: 0 });
  });

  it("computes mixed units correctly", () => {
    const now = new Date("2024-06-01T00:00:00Z");
    // 2 days, 3 hours, 15 minutes, 30 seconds later
    const target = new Date(
      now.getTime() + (2 * 86400 + 3 * 3600 + 15 * 60 + 30) * 1000
    );
    const result = computeTimeRemaining(target, now);
    expect(result).toEqual({ days: 2, hours: 3, minutes: 15, seconds: 30 });
  });

  it("computes seconds-only difference", () => {
    const now = new Date("2024-06-01T00:00:00Z");
    const target = new Date(now.getTime() + 45 * 1000);
    const result = computeTimeRemaining(target, now);
    expect(result).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 45 });
  });
});
