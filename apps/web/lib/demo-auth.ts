/**
 * Demo-auth session cookie. Presence of the httpOnly cookie marks an active
 * demo session; credentials are validated server-side only and are
 * intentionally public for evaluation (login page + README).
 */
const SESSION_COOKIE = "ibuki-session";
const ONE_DAY_SECONDS = 86_400;

export function sessionCookie(value: string): string {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${ONE_DAY_SECONDS}`;
}
