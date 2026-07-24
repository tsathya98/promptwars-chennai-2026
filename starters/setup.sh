#!/bin/bash
# PromptWars starter scaffold.
# Usage: ./setup.sh              → scaffold INTO THE REPO ROOT (default —
#                                  this repo IS the project on event day)
#        ./setup.sh <app-name>   → scaffold into a subfolder (e.g. tonight's
#                                  test-run; folder is git-ignored if named test-run)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"

if [ -z "${1:-}" ]; then
  # ── in-place: create-next-app refuses non-empty dirs, so scaffold in a
  #    temp dir and move in without clobbering kit files.
  TMP="$(mktemp -d)/app"
  npx create-next-app@latest "$TMP" --ts --tailwind --eslint --app --src-dir=false \
    --import-alias "@/*" --use-npm --yes
  rm -f "$TMP/README.md" "$TMP/.gitignore"   # kit root keeps its own
  cp -Rn "$TMP/." "$ROOT/"
  rm -rf "$(dirname "$TMP")"
  cd "$ROOT"
  npm install
  # Dockerfile/.dockerignore/.env.example already live at repo root.
  cp "$HERE/templates/.env.example" .env.local
else
  APP="$1"
  npx create-next-app@latest "$APP" --ts --tailwind --eslint --app --src-dir=false \
    --import-alias "@/*" --use-npm --yes
  cd "$APP"
  cp "$HERE/templates/.env.example" .env.example
  cp "$HERE/templates/.env.example" .env.local
  cp "$HERE/templates/.gitignore" .gitignore
  cp "$HERE/templates/Dockerfile" Dockerfile
  cp "$HERE/templates/.dockerignore" .dockerignore
fi

npm i ai @ai-sdk/google @ai-sdk/react @google/genai zod lucide-react recharts
npx shadcn@latest init -d --yes || true
npx shadcn@latest add button card input skeleton badge --yes || true

# Golden template files
cp -R "$HERE/templates/lib" .
mkdir -p app/api/health app/api/chat components fixtures scripts
cp "$HERE/templates/app/api/health/route.ts" app/api/health/route.ts
cp "$HERE/templates/app/api/chat/route.ts" app/api/chat/route.ts
cp "$HERE/templates/components/widget-renderer.tsx" components/
cp "$HERE/templates/components/cursor-field.tsx" components/
cp "$HERE/templates/components/spotlight-card.tsx" components/
cp "$HERE/templates/scripts/agy-batch.mjs" scripts/ && chmod +x scripts/agy-batch.mjs

echo ""
echo "✅ Scaffold ready in $(pwd). Next:"
echo "  1. Fill .env.local (GEMINI_API_KEY etc. — root .env values work too)"
echo "  2. npm run dev  →  check http://localhost:3000/api/health"
echo "  3. npx vercel --prod  (env vars: npx vercel env add GEMINI_API_KEY)"
