import { describe, expect, it } from "vitest";

import { LANGUAGE_CODES } from "./languages";
import { COMMAND_BUTTONS } from "./safety-router";
import { t, UI_KEYS, UI_STRINGS } from "./ui-strings";

describe("crisis-path UI localization", () => {
  it("covers every key in every supported language — no blank buttons possible", () => {
    for (const code of LANGUAGE_CODES) {
      for (const key of UI_KEYS) {
        expect(UI_STRINGS[code]?.[key], `${code}.${key}`).toBeTruthy();
      }
    }
  });

  it("keeps English command strings identical to the safety router's canonical labels", () => {
    for (const btn of COMMAND_BUTTONS) {
      expect(t("en", `cmd_${btn.id}_label` as never)).toBe(btn.label);
      expect(t("en", `cmd_${btn.id}_desc` as never)).toBe(btn.description);
    }
  });

  it("falls back to English for any lookup on the canonical language", () => {
    expect(t("en", "emergencyHelp")).toBe("Emergency help");
    expect(t("ta", "emergencyHelp")).not.toBe("");
  });
});
