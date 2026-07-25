import { afterEach, describe, expect, it, vi } from "vitest";

import { POST as guestPost } from "@/app/api/auth/guest/route";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as speechPost } from "@/app/api/speech/route";

/** Builds a JSON POST Request for direct route-handler invocation. */
const jsonRequest = (url: string, body: unknown) =>
  new Request(`http://test${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("demo auth routes", () => {
  it("issues an httpOnly demo session for the published credentials", async () => {
    const res = await loginPost(
      jsonRequest("/api/auth/login", { username: "ibuki-demo", password: "circle2026" }),
    );
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("ibuki-session=demo-");
    expect(cookie).toContain("HttpOnly");
  });

  it("rejects wrong credentials with 401 and no cookie", async () => {
    const res = await loginPost(
      jsonRequest("/api/auth/login", { username: "x", password: "y" }),
    );
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("rejects malformed bodies with 400", async () => {
    const res = await loginPost(jsonRequest("/api/auth/login", { username: "only" }));
    expect(res.status).toBe(400);
  });

  it("always grants guest entry with a distinct session prefix", async () => {
    const res = await guestPost();
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("ibuki-session=guest-");
  });
});

describe("speech route validation", () => {
  it("rejects empty and oversized text before any provider call", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const empty = await speechPost(jsonRequest("/api/speech", { text: "" }));
    expect(empty.status).toBe(400);
    const oversized = await speechPost(jsonRequest("/api/speech", { text: "a".repeat(801) }));
    expect(oversized.status).toBe(400);
  });

  it("reports 503 honestly when read-aloud is not configured", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("OPEN_AI_API_KEY", "");
    const res = await speechPost(jsonRequest("/api/speech", { text: "hello" }));
    expect(res.status).toBe(503);
  });
});
