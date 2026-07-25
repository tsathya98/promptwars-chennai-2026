import { describe, expect, it } from "vitest";

import {
  getResource,
  isResourceId,
  resourceCatalogForPrompt,
  VERIFIED_RESOURCES,
} from "./resources";

describe("verified resource registry", () => {
  it("has unique ids and https sources with review dates", () => {
    const ids = VERIFIED_RESOURCES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const resource of VERIFIED_RESOURCES) {
      expect(resource.url, resource.id).toMatch(/^https:\/\//);
      expect(resource.organization.length).toBeGreaterThan(0);
      expect(resource.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("carries the three India helpline numbers", () => {
    expect(getResource("erss-112")?.phone).toBe("112");
    expect(getResource("deaddiction-14446")?.phone).toBe("14446");
    expect(getResource("telemanas-14416")?.phone).toBe("14416");
  });

  it("keeps the overdose protocol as deterministic reviewed steps", () => {
    const overdose = getResource("overdose-response");
    expect(overdose?.steps?.length).toBeGreaterThanOrEqual(4);
    expect(overdose?.steps?.[0]).toContain("112");
  });

  it("rejects ids outside the registry", () => {
    expect(isResourceId("made-up-helpline")).toBe(false);
    expect(isResourceId("urge-grounding")).toBe(true);
  });

  it("scopes the prompt catalog by audience", () => {
    const individual = resourceCatalogForPrompt("individual");
    const caregiver = resourceCatalogForPrompt("caregiver");
    expect(individual).toContain("urge-grounding");
    expect(individual).not.toContain("caregiver-selfcare");
    expect(caregiver).toContain("caregiver-selfcare");
  });
});
