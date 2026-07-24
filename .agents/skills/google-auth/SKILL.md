---
name: google-auth
description: Implement "Sign in with Google" in a Next.js App Router app — Auth.js v5 Google provider (primary path) or Google Identity Services One Tap (flashy path), JWT sessions without a database, demo-safe guest mode. Use whenever adding login, authentication, user identity, or personalization.
---

# Sign in with Google (Next.js App Router)

## When to build auth at all

Only when the problem statement needs user identity/personalization OR a login screen adds real demo value (it's also a visible Google-stack checkbox). Otherwise skip auth entirely (rapid-mvp scope rules). Never build custom email/password auth under time pressure.

## Path A — Auth.js v5 + Google provider (default, ~20 min)

**v5 facts (do not use v4 patterns):** config lives in a root `auth.ts` (NOT `pages/api`); `getServerSession` is gone — the exported `auth()` works in Server Components, Route Handlers, middleware, and Server Actions; `AUTH_SECRET` is mandatory.

```bash
pnpm add next-auth@beta   # Auth.js v5
pnpm dlx auth secret        # writes AUTH_SECRET to .env.local
```

`auth.ts` (repo root) — JWT strategy, **no database**:
```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google], // reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET automatically
  session: { strategy: "jwt" },
});
```

`app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

Server component usage:
```ts
import { auth, signIn, signOut } from "@/auth";
const session = await auth();          // { user: { name, email, image } } | null
// <form action={async () => { "use server"; await signIn("google"); }}>
```

Env vars: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — set locally AND in Vercel (`pnpm dlx vercel env add ...`).

**Sign-in button**: follow Google branding (official "G" logo, "Sign in with Google" label) — judges notice correct branding. Show the user's avatar + first name in the header after login; it's the cheapest personalization wow.

## Path B — Google Identity Services One Tap (flashier, ~40 min, only if hours remain)

The One Tap overlay ("Continue as <name>") is a visibly-Google moment: load `https://accounts.google.com/gsi/client`, render `google.accounts.id.prompt()`, POST the returned ID token to a route handler, verify with `google-auth-library`'s `verifyIdToken`, then set your own session cookie (signed with `jose`). More moving parts — default to Path A.

## Google Cloud Console prerequisite (do the NIGHT BEFORE — consent screens are fiddly)

1. console.cloud.google.com → APIs & Services → OAuth consent screen: External, add your Google accounts as **test users** (test mode is fine for a demo).
2. Credentials → Create OAuth client ID (Web application):
   - Authorized JavaScript origins: `http://localhost:3000` (+ the Vercel URL once known)
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (+ `https://<app>.vercel.app/api/auth/callback/google` — **no wildcards allowed**; add the exact production URL at the venue, takes 1 minute, propagates fast)
3. Store client ID + secret in the password manager, NOT in the repo.

## Demo guardrails

- **Guest mode is mandatory**: a "Continue as guest" button that sets a fake session — judges on their phones must never be blocked by a consent screen, and the pitch must survive venue-WiFi OAuth hiccups.
- Auth failure → guest mode fallback, never a dead end.
- Gate only what personalization needs; keep the core demo reachable logged-out.
- Middleware route protection: skip unless the problem demands it — client-side conditional UI is enough for a demo.
