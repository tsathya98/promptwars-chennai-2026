# IBUKI Circle — PromptWars Chennai 2026

This repository is the working hackathon submission: an Nx 23 workspace containing
the deployed recovery and prevention web application.

## Active layout

- `apps/web` — Next.js 16 App Router, React 19, Tailwind CSS 4, and Vitest.
- `apps/web/lib/model-provider.ts` — model-agnostic generation layer
  (`MODEL_PROVIDER=openai|gemini`, automatic cross-provider fallback) over the
  `lib/openai.ts` and `lib/gemini.ts` wrappers.
- `apps/web/lib/agents/` — specialist registry and intervention orchestrator.
- `apps/web/lib/{schemas,safety-router,resources,connectors}.ts` — typed safety,
  resource, widget, and browser-action boundaries.
- `apps/web/app/api/intervene` — validated NDJSON intervention stream.
- `apps/web/app/api/realtime/token` — ephemeral live-voice credential route.
- `apps/web/app/api/health` — live model and registry verification.

Run tasks through Nx:

```bash
pnpm nx dev web
pnpm nx test web
pnpm nx lint web
pnpm nx build web
```

Use pnpm for JavaScript dependencies; never npm or yarn. Nx details are in
`docs/06-nx-workspace-notes.md`.

## Ground rules

1. **Protect the safety boundary.** Level 1 emergency routing and verified resources
   must never depend on a model. Model output remains schema-validated intent;
   deterministic code owns widgets, resources, and connectors.
2. **Use the provider layer, never a vendor SDK directly.** All structured
   generation goes through `lib/model-provider.ts` (OpenAI `gpt-5.6-terra`
   default, Gemini `gemini-3.6-flash` option, automatic fallback);
   `gpt-realtime` powers live voice and `gpt-4o-mini-tts` read-aloud. The
   OpenAI key is region-pinned to `https://us.api.openai.com/v1`. Smoke-test
   any model ID against its real host before adding it to code.
3. **Use repository skills deliberately.** Apply `rapid-mvp` to feature scope,
   `openai` to model/API work, `interactive-ui` to user-facing UI, and
   `demo-polish` during final hardening.
4. **Keep judged claims truthful.** `README.md` is the jury-facing source of truth.
   Never claim an unshipped feature, successful external action, or fallback fixture
   as live AI output.
5. **Read the relevant source documents.** `docs/00-problem-statement.md` defines
   the challenge, `docs/07-ibuki-circle-plan.md` records product architecture, and
   `docs/06-nx-workspace-notes.md` covers workspace commands.
6. **Deploy and verify.** Vercel uses `apps/web` as its root. Check `/api/health`
   after deployment. The root `Dockerfile` is the standalone alternative.
7. **Do not add persistence casually.** This submission intentionally avoids
   storing transcripts, location, crisis history, contacts, or health information.
8. **Preserve user work.** Do not overwrite, revert, stage, or commit unrelated
   working-tree changes.

## Synchronization invariants

Guidance sync rule: `CLAUDE.md` is canonical. After editing it, mirror it to
`AGENTS.md` and verify both files are byte-identical:

```bash
cmp -s CLAUDE.md AGENTS.md
```

Repository skill sync rule: edit skills only in `.claude/skills`, mirror them to
`.agents/skills`, and verify both trees are identical:

```bash
rsync -a --delete .claude/skills/ .agents/skills/
diff -qr .claude/skills .agents/skills
```
