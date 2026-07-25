import { z } from "zod";

import { sessionCookie } from "@/lib/demo-auth";

const credentialsSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(160),
});

/**
 * Demo authentication. Credentials are validated SERVER-side (never shipped
 * in the client bundle) and are intentionally public for evaluation:
 * documented on the login page and in the README. Guest entry exists so a
 * person in crisis is never blocked by a form.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = credentialsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Enter a username and password." }, { status: 400 });
  }

  const expectedUser = process.env.DEMO_USERNAME ?? "ibuki-demo";
  const expectedPassword = process.env.DEMO_PASSWORD ?? "circle2026";
  if (parsed.data.username !== expectedUser || parsed.data.password !== expectedPassword) {
    return Response.json(
      { error: "Those credentials don't match. The demo login is shown right below the form." },
      { status: 401 },
    );
  }

  const response = Response.json({ ok: true });
  response.headers.set("Set-Cookie", sessionCookie(`demo-${crypto.randomUUID()}`));
  return response;
}
