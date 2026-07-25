/**
 * Shared clamping helpers — the "forgiving inputs, strict internals" boundary
 * between model-authored intent and the validated widget vocabulary. Every
 * model-provided number/string/list passes through one of these before it can
 * reach a schema, so out-of-range model output degrades gracefully instead of
 * failing validation.
 */

/** Clamps to an integer within [min, max]; non-finite input gets the fallback. */
export const clampInt = (n: unknown, min: number, max: number, fallback: number): number =>
  typeof n === "number" && Number.isFinite(n)
    ? Math.min(max, Math.max(min, Math.round(n)))
    : fallback;

/** Trims and hard-caps a string to `max` characters. */
export const clampText = (s: string, max: number): string => s.trim().slice(0, max);

/** Trims entries, drops empties, and caps the list at `max` items. */
export const clampList = (xs: string[], max: number): string[] =>
  xs.map((x) => x.trim()).filter(Boolean).slice(0, max);
