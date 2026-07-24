#!/bin/bash
# Bootstrap/verify the PRE-SCAFFOLDED Nx workspace (the workspace already lives
# at the repo root — apps/web + apps/backend — so there is nothing to scaffold).
# Run tonight to warm caches, and at the venue after cloning.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "── pnpm install (workspace)"
pnpm install

echo "── env files"
[ -f .env.local ] || cp .env.example .env.local
[ -f apps/web/.env.local ] || cp .env.example apps/web/.env.local
echo "   → fill GEMINI_API_KEY in apps/web/.env.local"

echo "── build check"
pnpm nx build web

echo "── optional python sidecar (skip unless needed)"
echo "   cd apps/backend && uv sync && pnpm nx serve backend"

echo ""
echo "✅ Workspace verified. Next:"
echo "  pnpm nx dev web         → http://localhost:3000 (+ /api/health)"
echo "  pnpm dlx vercel --prod  → set Root Directory to apps/web in Vercel"
echo "  gh repo edit --rename <real-project-name>   (once problem is known)"
