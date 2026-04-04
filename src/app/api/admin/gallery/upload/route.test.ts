import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

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

vi.mock("@/lib/gdrive", () => ({
  uploadToGoogleDrive: vi.fn(),
}));

function createUploadRequest(
  file?: { name: string; type: string; content: string } | null
): NextRequest {
  const req = new NextRequest("http://localhost/api/admin/gallery/upload", {
    method: "POST",
  });

  // Override formData() to return controlled data in test environment
  if (file) {
    const content = new TextEncoder().encode(file.content);
    const mockFile = {
      name: file.name,
      type: file.type,
      size: content.byteLength,
      arrayBuffer: vi.fn().mockResolvedValue(content.buffer),
    };
    const fd = new FormData();
    // Use Object.defineProperty to override get() behavior
    const originalGet = fd.get.bind(fd);
    fd.get = ((key: string) => {
      if (key === "file") return mockFile as unknown as File;
      return originalGet(key);
    }) as typeof fd.get;
    req.formData = vi.fn().mockResolvedValue(fd);
  } else {
    const fd = new FormData();
    req.formData = vi.fn().mockResolvedValue(fd);
  }

  return req;
}

describe("POST /api/admin/gallery/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 401 when not authenticated", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue(null);

    const { POST } = await import("./route");
    const response = await POST(createUploadRequest({ name: "photo.jpg", type: "image/jpeg", content: "data" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication required");
  });

  it("returns 400 when no file is provided", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const { POST } = await import("./route");
    const response = await POST(createUploadRequest(null));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("No file provided");
  });

  it("returns 400 for invalid file type", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const { POST } = await import("./route");
    const response = await POST(
      createUploadRequest({ name: "doc.pdf", type: "application/pdf", content: "data" })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Invalid file type");
  });

  it("uploads file and adds gallery entry on success", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const { uploadToGoogleDrive } = await import("@/lib/gdrive");
    vi.mocked(uploadToGoogleDrive).mockResolvedValue({
      fileId: "drive-file-123",
      url: "https://drive.google.com/uc?id=drive-file-123",
      thumbnailUrl: "https://drive.google.com/thumbnail?id=drive-file-123&sz=w400",
    });

    mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });

    const { POST } = await import("./route");
    const response = await POST(
      createUploadRequest({ name: "wedding.jpg", type: "image/jpeg", content: "imagedata" })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.photo).toBeDefined();
    expect(body.photo.url).toBe("https://drive.google.com/uc?id=drive-file-123");
    expect(body.photo.thumbnailUrl).toBe("https://drive.google.com/thumbnail?id=drive-file-123&sz=w400");
    expect(body.photo.driveFileId).toBe("drive-file-123");
    expect(mockUpdateOne).toHaveBeenCalledOnce();
  });

  it("returns 502 when Google Drive upload fails", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const { uploadToGoogleDrive } = await import("@/lib/gdrive");
    vi.mocked(uploadToGoogleDrive).mockRejectedValue(
      new Error("Google Drive upload failed: 500")
    );

    const { POST } = await import("./route");
    const response = await POST(
      createUploadRequest({ name: "photo.png", type: "image/png", content: "data" })
    );
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error).toBe("File upload failed");
  });

  it("returns 503 on database failure", async () => {
    const { verifyAuth } = await import("@/lib/auth");
    vi.mocked(verifyAuth).mockReturnValue({ role: "admin", iat: 0, exp: 0 });

    const { uploadToGoogleDrive } = await import("@/lib/gdrive");
    vi.mocked(uploadToGoogleDrive).mockResolvedValue({
      fileId: "f1",
      url: "https://drive.google.com/uc?id=f1",
      thumbnailUrl: "https://drive.google.com/thumbnail?id=f1&sz=w400",
    });

    const { getDb } = await import("@/lib/mongodb");
    vi.mocked(getDb).mockRejectedValueOnce(new Error("DB down"));

    const { POST } = await import("./route");
    const response = await POST(
      createUploadRequest({ name: "photo.jpg", type: "image/jpeg", content: "data" })
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Service temporarily unavailable");
  });
});
