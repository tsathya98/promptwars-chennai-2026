import { describe, expect, it } from "vitest";

import { allowRequest, clientKey } from "./rate-limit";

describe("fixed-window rate limiter", () => {
  it("allows up to the limit and then refuses within the window", () => {
    const t0 = 1_000_000;
    expect(allowRequest("test-a", "ip1", 2, t0)).toBe(true);
    expect(allowRequest("test-a", "ip1", 2, t0 + 1)).toBe(true);
    expect(allowRequest("test-a", "ip1", 2, t0 + 2)).toBe(false);
  });

  it("resets after the window rolls over", () => {
    const t0 = 2_000_000;
    expect(allowRequest("test-b", "ip1", 1, t0)).toBe(true);
    expect(allowRequest("test-b", "ip1", 1, t0 + 1)).toBe(false);
    expect(allowRequest("test-b", "ip1", 1, t0 + 60_001)).toBe(true);
  });

  it("isolates buckets and callers from each other", () => {
    const t0 = 3_000_000;
    expect(allowRequest("test-c", "ip1", 1, t0)).toBe(true);
    expect(allowRequest("test-c", "ip2", 1, t0)).toBe(true);
    expect(allowRequest("test-d", "ip1", 1, t0)).toBe(true);
  });

  it("derives the caller key from the first forwarded hop", () => {
    const req = new Request("http://test/", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
    });
    expect(clientKey(req)).toBe("203.0.113.7");
    expect(clientKey(new Request("http://test/"))).toBe("unknown");
  });
});
