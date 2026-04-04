import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockUpdateOne = vi.fn();
const mockFindOne = vi.fn();

vi.mock("@/lib/mongodb", () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: () => ({
      updateOne: mockUpdateOne,
      findOne: mockFindOne,
    }),
  }),
}));

vi.mock("@/lib/auth", () => ({
  verifyAuth: vi.fn(),
}));

function createRequest(body: unknown, authed = true): NextRequest {
  const req = new NextRequest("http://localhost/api/admin/wedding", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return req;
}

describe("PUT /api/admin/wedding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 401 when not authenticated", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue(null);

    const { PUT } = await import("./route");
    const response = await PUT(createRequest({ couple: {} }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication required");
  });

  it("updates couple info and returns updated document", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const coupleData = {
      bride: { name: "Jane", photo: "jane.jpg", bio: "Bride bio" },
      groom: { name: "John", photo: "john.jpg", bio: "Groom bio" },
      loveStory: "They met at a coffee shop",
    };

    const updatedDoc = { _id: "abc123", couple: coupleData, events: [] };
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1, upsertedId: null });
    mockFindOne.mockResolvedValue(updatedDoc);

    const { PUT } = await import("./route");
    const response = await PUT(createRequest({ couple: coupleData }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.wedding.couple).toEqual(coupleData);
    expect(mockUpdateOne).toHaveBeenCalledWith(
      {},
      { $set: expect.objectContaining({ couple: coupleData, updatedAt: expect.any(Date) }) },
      { upsert: true }
    );
  });

  it("updates events and returns updated document", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const events = [
      { title: "Ceremony", date: "2025-12-01", time: "10:00", venueName: "Church", venueAddress: "123 Main St" },
    ];

    const updatedDoc = { _id: "abc123", events };
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1, upsertedId: null });
    mockFindOne.mockResolvedValue(updatedDoc);

    const { PUT } = await import("./route");
    const response = await PUT(createRequest({ events }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.wedding.events).toEqual(events);
  });

  it("upserts when no wedding document exists", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const coupleData = {
      bride: { name: "A", photo: "a.jpg", bio: "A" },
      groom: { name: "B", photo: "b.jpg", bio: "B" },
      loveStory: "Story",
    };

    mockUpdateOne.mockResolvedValue({ modifiedCount: 0, upsertedId: "new-id" });
    mockFindOne.mockResolvedValue({ _id: "new-id", couple: coupleData });

    const { PUT } = await import("./route");
    const response = await PUT(createRequest({ couple: coupleData }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.upsertedId).toBe("new-id");
  });

  it("sets updatedAt on every update", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    mockUpdateOne.mockResolvedValue({ modifiedCount: 1, upsertedId: null });
    mockFindOne.mockResolvedValue({ _id: "abc123" });

    const { PUT } = await import("./route");
    await PUT(createRequest({ heroPhoto: "hero.jpg" }));

    const setArg = mockUpdateOne.mock.calls[0][1].$set;
    expect(setArg.updatedAt).toBeInstanceOf(Date);
  });

  it("returns 400 for invalid JSON body", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const { PUT } = await import("./route");
    const request = new NextRequest("http://localhost/api/admin/wedding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid request body");
  });

  it("returns 503 on database failure", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const { getDb } = await import("@/lib/mongodb");
    vi.mocked(getDb).mockRejectedValueOnce(new Error("DB down"));

    const { PUT } = await import("./route");
    const response = await PUT(createRequest({ couple: {} }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Service temporarily unavailable");
  });
});
