import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

const mockUpdateOne = vi.fn();

vi.mock("@/lib/mongodb", () => ({
  getDb: vi.fn().mockResolvedValue({
    collection: () => ({
      updateOne: mockUpdateOne,
    }),
  }),
}));

vi.mock("@/lib/auth", () => ({
  verifyAuth: vi.fn(),
}));

function createDeleteRequest(id: string): NextRequest {
  return new NextRequest(`http://localhost/api/admin/wishes/${id}`, {
    method: "DELETE",
  });
}

describe("DELETE /api/admin/wishes/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 401 when not authenticated", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue(null);

    const { DELETE } = await import("./route");
    const id = new ObjectId().toString();
    const response = await DELETE(createDeleteRequest(id), { params: { id } });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication required");
  });

  it("returns 400 for invalid ObjectId", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const { DELETE } = await import("./route");
    const response = await DELETE(createDeleteRequest("invalid-id"), {
      params: { id: "invalid-id" },
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid wish ID");
  });

  it("sets approved to false and returns success", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const wishId = new ObjectId();
    mockUpdateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

    const { DELETE } = await import("./route");
    const id = wishId.toString();
    const response = await DELETE(createDeleteRequest(id), { params: { id } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.deletedId).toBe(id);
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { _id: wishId },
      { $set: { approved: false } }
    );
  });

  it("returns 404 when wish not found", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    mockUpdateOne.mockResolvedValue({ matchedCount: 0, modifiedCount: 0 });

    const { DELETE } = await import("./route");
    const id = new ObjectId().toString();
    const response = await DELETE(createDeleteRequest(id), { params: { id } });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Not found");
  });

  it("returns 503 on database failure", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const { getDb } = await import("@/lib/mongodb");
    vi.mocked(getDb).mockRejectedValueOnce(new Error("DB down"));

    const { DELETE } = await import("./route");
    const id = new ObjectId().toString();
    const response = await DELETE(createDeleteRequest(id), { params: { id } });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Service temporarily unavailable");
  });
});
