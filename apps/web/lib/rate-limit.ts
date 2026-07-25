/**
 * Minimal fixed-window rate limiter for public model-backed routes. In-memory
 * and therefore PER-SERVERLESS-INSTANCE: an honest deterrent against bursts
 * and accidental polling, not a distributed quota system (that would require
 * shared storage, deliberately out of scope for this deployment).
 */
type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();
const WINDOW_MS = 60_000;
const MAX_TRACKED_KEYS = 1_000;

/** Identifies the caller from the first x-forwarded-for hop (set by Vercel). */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/** True while the caller stays within `limit` requests/minute for `bucket`. */
export function allowRequest(
  bucket: string,
  key: string,
  limit: number,
  now = Date.now(),
): boolean {
  if (windows.size > MAX_TRACKED_KEYS) {
    for (const [id, win] of windows) if (now >= win.resetAt) windows.delete(id);
  }
  const id = `${bucket}:${key}`;
  const win = windows.get(id);
  if (!win || now >= win.resetAt) {
    windows.set(id, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (win.count >= limit) return false;
  win.count += 1;
  return true;
}

/** Standard honest 429 payload for rate-limited callers. */
export function rateLimitResponse(): Response {
  return Response.json(
    { error: "Too many requests — please wait a moment and try again." },
    { status: 429 },
  );
}
