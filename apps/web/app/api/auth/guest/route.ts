import { sessionCookie } from "@/lib/demo-auth";

/** One-tap guest entry — a crisis-support app must never lock anyone out. */
export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.set("Set-Cookie", sessionCookie(`guest-${crypto.randomUUID()}`));
  return response;
}
