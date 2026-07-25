import { describe, expect, it } from "vitest";

import { sessionCookie } from "./demo-auth";

describe("demo-auth session cookie", () => {
  it("is httpOnly, secure, lax, path-scoped, and expiring", () => {
    const cookie = sessionCookie("demo-abc");
    expect(cookie).toContain("ibuki-session=demo-abc");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toMatch(/Max-Age=\d+/);
  });
});
