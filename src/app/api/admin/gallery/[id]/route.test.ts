import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

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

vi.mock("@/lib/gdrive", () => ({
  deleteFromGoogleDrive: vi.fn(),
}));

function createDeleteRequest(id: string): NextRequest {
  return new NextRequest(`http://localhost/api/admin/gallery/${id}`, {
    method: "DELETE",
  });
}

describe("DELETE /api/admin/gallery/:id", () => {
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
    expect(body.error).toBe("Invalid photo ID");
  });

  it("returns 404 when no wedding document exists", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    mockFindOne.mockResolvedValue(null);

    const { DELETE } = await import("./route");
    const id = new ObjectId().toString();
    const response = await DELETE(createDeleteRequest(id), { params: { id } });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Not found");
  });

  it("returns 404 when photo is not in gallery", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    mockFindOne.mockResolvedValue({
      _id: new ObjectId(),
      gallery: [{ _id: new ObjectId(), url: "url1", thumbnailUrl: "thumb1", order: 1 }],
    });

    const { DELETE } = await import("./route");
    const id = new ObjectId().toString();
    const response = await DELETE(createDeleteRequest(id), { params: { id } });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Photo not found");
  });

  it("deletes photo from gallery and Google Drive", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const { deleteFromGoogleDrive } = await import("@/lib/gdrive");
    vi.mocked(deleteFromGoogleDrive).mockResolvedValue(undefined);

    const photoId = new ObjectId();
    mockFindOne.mockResolvedValue({
      _id: new ObjectId(),
      gallery: [
        {
          _id: photoId,
          url: "https://drive.google.com/uc?id=abc",
          thumbnailUrl: "https://drive.google.com/thumbnail?id=abc&sz=w400",
          driveFileId: "abc",
          order: 1,
        },
      ],
    });
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });

    const { DELETE } = await import("./route");
    const id = photoId.toString();
    const response = await DELETE(createDeleteRequest(id), { params: { id } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.deletedId).toBe(id);
    expect(mockUpdateOne).toHaveBeenCalledOnce();
    expect(vi.mocked(deleteFromGoogleDrive)).toHaveBeenCalledWith("abc");
  });

  it("succeeds even if Google Drive deletion fails", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const { deleteFromGoogleDrive } = await import("@/lib/gdrive");
    vi.mocked(deleteFromGoogleDrive).mockRejectedValue(new Error("Drive error"));

    const photoId = new ObjectId();
    mockFindOne.mockResolvedValue({
      _id: new ObjectId(),
      gallery: [
        {
          _id: photoId,
          url: "url",
          thumbnailUrl: "thumb",
          driveFileId: "xyz",
          order: 1,
        },
      ],
    });
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });

    const { DELETE } = await import("./route");
    const id = photoId.toString();
    const response = await DELETE(createDeleteRequest(id), { params: { id } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
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
