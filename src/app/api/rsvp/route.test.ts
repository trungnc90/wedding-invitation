import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

const mockInsertOne = vi.fn();

vi.mock("@/lib/mongodb", () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: () => ({
      insertOne: mockInsertOne,
    }),
  }),
}));

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/rsvp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertOne.mockResolvedValue({ insertedId: "abc123" });
  });

  it("returns 201 with success for a valid RSVP (attending)", async () => {
    const response = await POST(
      createRequest({
        name: "Alice",
        attending: true,
        numberOfAttendees: 2,
        message: "Looking forward to it!",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(mockInsertOne).toHaveBeenCalledOnce();

    const inserted = mockInsertOne.mock.calls[0][0];
    expect(inserted.name).toBe("Alice");
    expect(inserted.attending).toBe(true);
    expect(inserted.numberOfAttendees).toBe(2);
    expect(inserted.message).toBe("Looking forward to it!");
    expect(inserted.createdAt).toBeInstanceOf(Date);
  });

  it("returns 201 for a valid RSVP (not attending)", async () => {
    const response = await POST(
      createRequest({
        name: "Bob",
        attending: false,
      })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);

    const inserted = mockInsertOne.mock.calls[0][0];
    expect(inserted.name).toBe("Bob");
    expect(inserted.attending).toBe(false);
    expect(inserted.numberOfAttendees).toBe(0);
  });

  it("returns 400 with field errors for missing name", async () => {
    const response = await POST(
      createRequest({
        attending: true,
        numberOfAttendees: 1,
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(body.fields.name).toBeDefined();
    expect(mockInsertOne).not.toHaveBeenCalled();
  });

  it("returns 400 with field errors for missing attending", async () => {
    const response = await POST(
      createRequest({
        name: "Charlie",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(body.fields.attending).toBeDefined();
    expect(mockInsertOne).not.toHaveBeenCalled();
  });

  it("returns 400 when attending is true but numberOfAttendees is missing", async () => {
    const response = await POST(
      createRequest({
        name: "Diana",
        attending: true,
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.fields.numberOfAttendees).toBeDefined();
    expect(mockInsertOne).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid JSON body", async () => {
    const request = new NextRequest("http://localhost/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(mockInsertOne).not.toHaveBeenCalled();
  });

  it("returns 503 on database failure", async () => {
    const { getDb } = await import("@/lib/mongodb");
    vi.mocked(getDb).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await POST(
      createRequest({
        name: "Eve",
        attending: true,
        numberOfAttendees: 1,
      })
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Service temporarily unavailable");
  });

  it("trims whitespace from name and message", async () => {
    const response = await POST(
      createRequest({
        name: "  Alice  ",
        attending: true,
        numberOfAttendees: 1,
        message: "  Hello  ",
      })
    );

    expect(response.status).toBe(201);

    const inserted = mockInsertOne.mock.calls[0][0];
    expect(inserted.name).toBe("Alice");
    expect(inserted.message).toBe("Hello");
  });
});
