"use client";

/**
 * App-level error boundary (Next.js convention). If the UI ever crashes, the
 * user still gets an honest explanation, a retry, and the verified helplines —
 * a crisis-support surface must never dead-end. No model claims are made here.
 */
import { PhoneCall, RotateCcw } from "lucide-react";

const HELPLINES = [
  { phone: "112", label: "Emergency (ERSS)" },
  { phone: "14446", label: "De-addiction helpline" },
  { phone: "14416", label: "Tele-MANAS mental health" },
] as const;

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main" className="flex min-h-screen items-center justify-center px-4">
      <div className="surface flex w-full max-w-md flex-col gap-4 p-6">
        <p className="kicker">[ Something went wrong ]</p>
        <h1 className="text-xl font-extrabold">This screen hit an unexpected error.</h1>
        <p className="text-sm leading-relaxed text-[var(--text-soft)]">
          The app can try again — and the verified helplines below always work, with or without
          this page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--teal)]/15 text-sm font-bold text-[var(--teal)] transition-colors hover:bg-[var(--teal)]/25"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Try again
        </button>
        <div className="flex flex-col gap-2">
          {HELPLINES.map((h) => (
            <a
              key={h.phone}
              href={`tel:${h.phone}`}
              className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--text-soft)] transition-colors hover:border-[var(--line-hi)] hover:text-[var(--text)]"
            >
              <PhoneCall className="h-4 w-4" aria-hidden />
              Call {h.phone} — {h.label}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
