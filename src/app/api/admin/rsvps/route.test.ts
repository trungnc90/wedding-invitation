import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFind = vi.fn();
const mockToArray = vi.fn();

vi.mock("@/lib/mongodb", () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: () => ({
      find: mockFind,
    }),
  }),
}));

vi.mock("@/lib/auth", () => ({
  verifyAuth: vi.fn(),
}));

function createRequest(): NextRequest {
  return new NextRequest("http://localhost/api/admin/rsvps", {
    method: "GET",
  });
}

describe("GET /api/admin/rsvps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockFind.mockReturnValue({ toArray: mockToArray });
  });

  it("returns 401 when not authenticated", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue(null);

    const { GET } = await import("./route");
    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication required");
  });

  it("returns all RSVP records when authenticated", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const rsvps = [
      { _id: "1", name: "Alice", attending: true, numberOfAttendees: 2, message: "Excited!", createdAt: new Date() },
      { _id: "2", name: "Bob", attending: false, numberOfAttendees: 1, message: "", createdAt: new Date() },
    ];
    mockToArray.mockResolvedValue(rsvps);

    const { GET } = await import("./route");
    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].name).toBe("Alice");
    expect(body[1].name).toBe("Bob");
  });

  it("returns empty array when no RSVPs exist", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    mockToArray.mockResolvedValue([]);

    const { GET } = await import("./route");
    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns 503 on database failure", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const { getDb } = await import("@/lib/mongodb");
    vi.mocked(getDb).mockRejectedValueOnce(new Error("DB down"));

    const { GET } = await import("./route");
    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Service temporarily unavailable");
  });
});
