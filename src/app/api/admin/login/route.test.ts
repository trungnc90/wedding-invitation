import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const TEST_JWT_SECRET = "test-jwt-secret";
const TEST_PASSWORD = "my-admin-password";
let TEST_PASSWORD_HASH: string;

// Generate hash before tests
beforeEach(async () => {
  TEST_PASSWORD_HASH = await bcrypt.hash(TEST_PASSWORD, 10);
  vi.stubEnv("ADMIN_PASSWORD_HASH", TEST_PASSWORD_HASH);
  vi.stubEnv("JWT_SECRET", TEST_JWT_SECRET);
});

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/login", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns 200 with httpOnly auth_token cookie on correct password", async () => {
    const { POST } = await import("./route");
    const response = await POST(createRequest({ password: TEST_PASSWORD }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain("auth_token=");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/");
  });

  it("returns a valid JWT in the cookie", async () => {
    const { POST } = await import("./route");
    const response = await POST(createRequest({ password: TEST_PASSWORD }));

    const setCookie = response.headers.get("set-cookie")!;
    const tokenMatch = setCookie.match(/auth_token=([^;]+)/);
    expect(tokenMatch).not.toBeNull();

    const token = tokenMatch![1];
    const decoded = jwt.verify(token, TEST_JWT_SECRET) as Record<string, unknown>;
    expect(decoded.role).toBe("admin");
    expect(decoded.exp).toBeDefined();
  });

  it("returns 401 with 'Invalid password' for wrong password", async () => {
    const { POST } = await import("./route");
    const response = await POST(createRequest({ password: "wrong-password" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Invalid password");
  });

  it("returns 400 when password is missing", async () => {
    const { POST } = await import("./route");
    const response = await POST(createRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Password is required");
  });

  it("returns 400 when password is not a string", async () => {
    const { POST } = await import("./route");
    const response = await POST(createRequest({ password: 123 }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Password is required");
  });

  it("returns 400 for invalid JSON body", async () => {
    const { POST } = await import("./route");
    const request = new NextRequest("http://localhost/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid request body");
  });
});
