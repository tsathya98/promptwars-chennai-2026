"use client";

import { useState } from "react";
import { HeartHandshake, KeyRound, LogIn, PhoneCall, UserRound } from "lucide-react";

const DEMO_USERNAME = "ibuki-demo";
const DEMO_PASSWORD = "circle2026";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const enter = async (path: string, body?: object) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!res.ok) {
        const detail = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(detail?.error ?? "Sign-in failed — try guest access below.");
        setBusy(false);
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Network hiccup — try again or continue as guest.");
      setBusy(false);
    }
  };

  return (
    <main id="main" className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div aria-hidden className="orb absolute -top-32 right-[-100px]" />
      <div aria-hidden className="orb orb-violet absolute bottom-[-160px] left-[-120px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="kicker mb-2">[ Recovery &amp; prevention platform ]</p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            IBUKI <span className="hero-serif font-semibold text-[var(--teal)]">Circle</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--text-soft)]">
            One breath. One tap. Your circle responds.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void enter("/api/auth/login", { username, password });
          }}
          className="surface flex flex-col gap-4 p-6"
        >
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Username
            <span className="relative">
              <UserRound
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-soft)]"
                aria-hidden
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={`demo: ${DEMO_USERNAME}`}
                autoComplete="username"
                className="min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)]/60 pl-10 pr-4 text-sm font-normal placeholder:text-[var(--text-soft)]/60 focus:border-[var(--teal)] focus:outline-none"
              />
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Password
            <span className="relative">
              <KeyRound
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-soft)]"
                aria-hidden
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`demo: ${DEMO_PASSWORD}`}
                autoComplete="current-password"
                className="min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)]/60 pl-10 pr-4 text-sm font-normal placeholder:text-[var(--text-soft)]/60 focus:border-[var(--teal)] focus:outline-none"
              />
            </span>
          </label>

          {error && (
            <p role="alert" className="text-sm text-[var(--amber)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--teal)]/15 text-sm font-bold text-[var(--teal)] transition-colors hover:bg-[var(--teal)]/25 disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" aria-hidden />
            Enter IBUKI Circle
          </button>

          <div className="rounded-xl border border-[var(--indigo)]/30 bg-[var(--indigo)]/8 p-3 text-xs text-[var(--text-soft)]">
            <span className="font-bold text-[var(--indigo)]">Demo access for evaluators:</span>{" "}
            username <code className="font-mono text-[var(--text)]">{DEMO_USERNAME}</code> ·
            password <code className="font-mono text-[var(--text)]">{DEMO_PASSWORD}</code>
            <button
              type="button"
              onClick={() => {
                setUsername(DEMO_USERNAME);
                setPassword(DEMO_PASSWORD);
              }}
              className="ml-2 rounded-md border border-[var(--indigo)]/40 px-2 py-0.5 font-semibold text-[var(--indigo)] hover:bg-[var(--indigo)]/15"
            >
              Fill
            </button>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => void enter("/api/auth/guest")}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--line)] text-sm font-semibold text-[var(--text-soft)] transition-colors hover:border-[var(--line-hi)] hover:text-[var(--text)] disabled:opacity-50"
          >
            <HeartHandshake className="h-4 w-4" aria-hidden />
            Continue as guest — no account needed
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-[var(--text-soft)]">
          In immediate danger, don&apos;t sign in — call{" "}
          <a href="tel:112" className="inline-flex items-center gap-1 font-bold text-[var(--crisis-soft)] underline">
            <PhoneCall className="h-3 w-3" aria-hidden />
            112
          </a>{" "}
          now.
        </p>
      </div>
    </main>
  );
}
