import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

const mockFindOne = vi.fn();

vi.mock("@/lib/mongodb", () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: () => ({
      findOne: mockFindOne,
    }),
  }),
}));

describe("GET /api/wedding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the wedding document as JSON", async () => {
    const weddingDoc = {
      _id: "abc123",
      couple: {
        bride: { name: "Bride", photo: "photo.jpg", bio: "Bio" },
        groom: { name: "Groom", photo: "photo2.jpg", bio: "Bio2" },
        loveStory: "A love story",
      },
      weddingDate: new Date("2025-12-01"),
      events: [],
      gallery: [],
    };
    mockFindOne.mockResolvedValue(weddingDoc);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.couple.bride.name).toBe("Bride");
    expect(body.couple.groom.name).toBe("Groom");
    expect(body.couple.loveStory).toBe("A love story");
    expect(body.events).toEqual([]);
    expect(body.gallery).toEqual([]);
  });

  it("returns 404 when no wedding document exists", async () => {
    mockFindOne.mockResolvedValue(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Not found");
  });

  it("returns 503 on database connection failure", async () => {
    const { getDb } = await import("@/lib/mongodb");
    vi.mocked(getDb).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Service temporarily unavailable");
  });
});
