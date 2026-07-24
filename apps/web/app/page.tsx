import { CursorField } from "@/components/cursor-field";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <CursorField />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-4xl font-bold tracking-tight">PromptWars 2026</h1>
        <p className="text-zinc-400">Walking skeleton ready — waiting for the problem statement.</p>
        <a href="/api/health" className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
          Check Gemini connection →
        </a>
      </div>
    </main>
  );
}
