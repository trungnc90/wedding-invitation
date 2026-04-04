import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const TEST_JWT_SECRET = "test-secret-key";

vi.stubEnv("JWT_SECRET", TEST_JWT_SECRET);

// Must import after stubbing env
const { verifyAuth } = await import("./auth");

function createRequestWithCookie(cookieValue?: string): NextRequest {
  const req = new NextRequest("http://localhost/api/admin/wedding", {
    method: "GET",
  });
  if (cookieValue !== undefined) {
    req.cookies.set("auth_token", cookieValue);
  }
  return req;
}

describe("verifyAuth", () => {
  it("returns decoded payload for a valid token", () => {
    const token = jwt.sign({ role: "admin" }, TEST_JWT_SECRET, {
      expiresIn: "24h",
    });
    const req = createRequestWithCookie(token);
    const result = verifyAuth(req);

    expect(result).not.toBeNull();
    expect(result!.role).toBe("admin");
    expect(result!.exp).toBeDefined();
    expect(result!.iat).toBeDefined();
  });

  it("returns null when no auth_token cookie is present", () => {
    const req = createRequestWithCookie();
    const result = verifyAuth(req);

    expect(result).toBeNull();
  });

  it("returns null for an expired token", () => {
    const token = jwt.sign({ role: "admin" }, TEST_JWT_SECRET, {
      expiresIn: "-1s",
    });
    const req = createRequestWithCookie(token);
    const result = verifyAuth(req);

    expect(result).toBeNull();
  });

  it("returns null for a token signed with a different secret", () => {
    const token = jwt.sign({ role: "admin" }, "wrong-secret", {
      expiresIn: "24h",
    });
    const req = createRequestWithCookie(token);
    const result = verifyAuth(req);

    expect(result).toBeNull();
  });

  it("returns null for a malformed token", () => {
    const req = createRequestWithCookie("not-a-valid-jwt");
    const result = verifyAuth(req);

    expect(result).toBeNull();
  });
});
