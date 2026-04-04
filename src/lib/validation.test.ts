import { describe, it, expect } from "vitest";
import { validateRSVP, validateWish } from "./validation";

describe("validateRSVP", () => {
  it("accepts a valid RSVP with attending=true", () => {
    const result = validateRSVP({
      name: "Alice",
      attending: true,
      numberOfAttendees: 3,
    });
    expect(result.valid).toBe(true);
    expect(result.fields).toEqual({});
  });

  it("accepts a valid RSVP with attending=false", () => {
    const result = validateRSVP({
      name: "Bob",
      attending: false,
    });
    expect(result.valid).toBe(true);
    expect(result.fields).toEqual({});
  });

  it("accepts a valid RSVP with optional message", () => {
    const result = validateRSVP({
      name: "Carol",
      attending: true,
      numberOfAttendees: 2,
      message: "Congratulations!",
    });
    expect(result.valid).toBe(true);
  });

  it("rejects missing name", () => {
    const result = validateRSVP({ attending: true, numberOfAttendees: 1 });
    expect(result.valid).toBe(false);
    expect(result.fields.name).toBeDefined();
  });

  it("rejects whitespace-only name", () => {
    const result = validateRSVP({
      name: "   ",
      attending: true,
      numberOfAttendees: 1,
    });
    expect(result.valid).toBe(false);
    expect(result.fields.name).toBeDefined();
  });

  it("rejects name exceeding 100 characters", () => {
    const result = validateRSVP({
      name: "a".repeat(101),
      attending: true,
      numberOfAttendees: 1,
    });
    expect(result.valid).toBe(false);
    expect(result.fields.name).toBeDefined();
  });

  it("rejects missing attending field", () => {
    const result = validateRSVP({ name: "Dave" });
    expect(result.valid).toBe(false);
    expect(result.fields.attending).toBeDefined();
  });

  it("rejects non-boolean attending", () => {
    const result = validateRSVP({ name: "Eve", attending: "yes" });
    expect(result.valid).toBe(false);
    expect(result.fields.attending).toBeDefined();
  });

  it("rejects numberOfAttendees < 1 when attending", () => {
    const result = validateRSVP({
      name: "Frank",
      attending: true,
      numberOfAttendees: 0,
    });
    expect(result.valid).toBe(false);
    expect(result.fields.numberOfAttendees).toBeDefined();
  });

  it("rejects numberOfAttendees > 10 when attending", () => {
    const result = validateRSVP({
      name: "Grace",
      attending: true,
      numberOfAttendees: 11,
    });
    expect(result.valid).toBe(false);
    expect(result.fields.numberOfAttendees).toBeDefined();
  });

  it("rejects non-integer numberOfAttendees when attending", () => {
    const result = validateRSVP({
      name: "Hank",
      attending: true,
      numberOfAttendees: 2.5,
    });
    expect(result.valid).toBe(false);
    expect(result.fields.numberOfAttendees).toBeDefined();
  });

  it("does not require numberOfAttendees when not attending", () => {
    const result = validateRSVP({ name: "Ivy", attending: false });
    expect(result.valid).toBe(true);
  });

  it("rejects message exceeding 500 characters", () => {
    const result = validateRSVP({
      name: "Jack",
      attending: true,
      numberOfAttendees: 1,
      message: "x".repeat(501),
    });
    expect(result.valid).toBe(false);
    expect(result.fields.message).toBeDefined();
  });

  it("rejects null payload", () => {
    const result = validateRSVP(null);
    expect(result.valid).toBe(false);
  });

  it("returns multiple field errors at once", () => {
    const result = validateRSVP({});
    expect(result.valid).toBe(false);
    expect(result.fields.name).toBeDefined();
    expect(result.fields.attending).toBeDefined();
  });
});

describe("validateWish", () => {
  it("accepts a valid wish", () => {
    const result = validateWish({
      name: "Alice",
      message: "Best wishes!",
    });
    expect(result.valid).toBe(true);
    expect(result.fields).toEqual({});
  });

  it("rejects missing name", () => {
    const result = validateWish({ message: "Hello" });
    expect(result.valid).toBe(false);
    expect(result.fields.name).toBeDefined();
  });

  it("rejects whitespace-only name", () => {
    const result = validateWish({ name: "  ", message: "Hello" });
    expect(result.valid).toBe(false);
    expect(result.fields.name).toBeDefined();
  });

  it("rejects name exceeding 100 characters", () => {
    const result = validateWish({
      name: "a".repeat(101),
      message: "Hello",
    });
    expect(result.valid).toBe(false);
    expect(result.fields.name).toBeDefined();
  });

  it("rejects missing message", () => {
    const result = validateWish({ name: "Bob" });
    expect(result.valid).toBe(false);
    expect(result.fields.message).toBeDefined();
  });

  it("rejects whitespace-only message", () => {
    const result = validateWish({ name: "Bob", message: "   " });
    expect(result.valid).toBe(false);
    expect(result.fields.message).toBeDefined();
  });

  it("rejects message exceeding 1000 characters", () => {
    const result = validateWish({
      name: "Carol",
      message: "x".repeat(1001),
    });
    expect(result.valid).toBe(false);
    expect(result.fields.message).toBeDefined();
  });

  it("rejects null payload", () => {
    const result = validateWish(null);
    expect(result.valid).toBe(false);
  });

  it("returns multiple field errors at once", () => {
    const result = validateWish({});
    expect(result.valid).toBe(false);
    expect(result.fields.name).toBeDefined();
    expect(result.fields.message).toBeDefined();
  });
});
