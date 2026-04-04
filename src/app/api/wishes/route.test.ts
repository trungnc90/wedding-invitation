import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";
import { NextRequest } from "next/server";

const mockInsertOne = vi.fn();
const mockFind = vi.fn();
const mockSort = vi.fn();
const mockToArray = vi.fn();

vi.mock("@/lib/mongodb", () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: (name: string) => {
      if (name === "wishes") {
        return {
          insertOne: mockInsertOne,
          find: mockFind,
        };
      }
      return {};
    },
  }),
}));

function createPostRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/wishes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/wishes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertOne.mockResolvedValue({ insertedId: "wish123" });
  });

  it("returns 201 with success for a valid wish", async () => {
    const response = await POST(
      createPostRequest({ name: "Alice", message: "Congratulations!" })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(mockInsertOne).toHaveBeenCalledOnce();

    const inserted = mockInsertOne.mock.calls[0][0];
    expect(inserted.name).toBe("Alice");
    expect(inserted.message).toBe("Congratulations!");
    expect(inserted.approved).toBe(true);
    expect(inserted.createdAt).toBeInstanceOf(Date);
  });

  it("returns 400 with field errors for missing name", async () => {
    const response = await POST(
      createPostRequest({ message: "Congrats!" })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(body.fields.name).toBeDefined();
    expect(mockInsertOne).not.toHaveBeenCalled();
  });

  it("returns 400 with field errors for missing message", async () => {
    const response = await POST(
      createPostRequest({ name: "Bob" })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(body.fields.message).toBeDefined();
    expect(mockInsertOne).not.toHaveBeenCalled();
  });

  it("returns 400 with field errors for empty name and message", async () => {
    const response = await POST(
      createPostRequest({ name: "   ", message: "" })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.fields.name).toBeDefined();
    expect(body.fields.message).toBeDefined();
    expect(mockInsertOne).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid JSON body", async () => {
    const request = new NextRequest("http://localhost/api/wishes", {
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
      createPostRequest({ name: "Eve", message: "Best wishes!" })
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Service temporarily unavailable");
  });

  it("trims whitespace from name and message", async () => {
    const response = await POST(
      createPostRequest({ name: "  Alice  ", message: "  Hello  " })
    );

    expect(response.status).toBe(201);

    const inserted = mockInsertOne.mock.calls[0][0];
    expect(inserted.name).toBe("Alice");
    expect(inserted.message).toBe("Hello");
  });
});

describe("GET /api/wishes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSort.mockReturnValue({ toArray: mockToArray });
    mockFind.mockReturnValue({ sort: mockSort });
  });

  it("returns only approved wishes sorted by createdAt descending", async () => {
    const now = new Date();
    const earlier = new Date(now.getTime() - 60000);
    const mockWishes = [
      { name: "Alice", message: "Congrats!", approved: true, createdAt: now },
      { name: "Bob", message: "Best wishes!", approved: true, createdAt: earlier },
    ];
    mockToArray.mockResolvedValue(mockWishes);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(mockFind).toHaveBeenCalledWith({ approved: true });
    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("returns empty array when no approved wishes exist", async () => {
    mockToArray.mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns 503 on database failure", async () => {
    const { getDb } = await import("@/lib/mongodb");
    vi.mocked(getDb).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Service temporarily unavailable");
  });
});
