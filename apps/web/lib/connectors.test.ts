import { describe, expect, it } from "vitest";

import { buildMapsLink, buildSmsLink, buildTelLink, buildWhatsAppLink } from "./connectors";

describe("connector link builders", () => {
  it("strips unsafe characters from tel links", () => {
    expect(buildTelLink("112")).toBe("tel:112");
    expect(buildTelLink("+91 14446; rm -rf")).toBe("tel:+9114446");
  });

  it("URL-encodes message bodies for SMS and WhatsApp", () => {
    const body = "I need support right now. Can you call me? #today & tomorrow";
    expect(buildSmsLink(body)).toBe(`sms:?&body=${encodeURIComponent(body)}`);
    expect(buildWhatsAppLink(body)).toBe(`https://wa.me/?text=${encodeURIComponent(body)}`);
    expect(buildWhatsAppLink(body)).not.toContain("#today");
  });

  it("rounds map coordinates and never embeds extra data", () => {
    expect(buildMapsLink(13.0826791234, 80.2707184321)).toBe(
      "https://maps.google.com/?q=13.08268,80.27072",
    );
  });
});
