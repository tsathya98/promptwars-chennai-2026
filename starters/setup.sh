#!/bin/bash
# PromptWars starter scaffold. Usage: ./setup.sh <app-name>
set -euo pipefail
APP="${1:-hackathon-app}"
HERE="$(cd "$(dirname "$0")" && pwd)"

npx create-next-app@latest "$APP" --ts --tailwind --eslint --app --src-dir=false \
  --import-alias "@/*" --use-npm --yes

cd "$APP"
npm i ai @ai-sdk/google @ai-sdk/react @google/genai zod lucide-react recharts
npx shadcn@latest init -d --yes || true
npx shadcn@latest add button card input skeleton badge --yes || true

# Copy golden templates over the scaffold
cp -R "$HERE/templates/lib" .
mkdir -p app/api/health app/api/chat
cp "$HERE/templates/app/api/health/route.ts" app/api/health/route.ts
cp "$HERE/templates/app/api/chat/route.ts" app/api/chat/route.ts
mkdir -p components fixtures scripts
cp "$HERE/templates/components/widget-renderer.tsx" components/
cp "$HERE/templates/components/cursor-field.tsx" components/
cp "$HERE/templates/components/spotlight-card.tsx" components/
cp "$HERE/templates/scripts/agy-batch.mjs" scripts/ && chmod +x scripts/agy-batch.mjs

# env, ignores, docker
cp "$HERE/templates/.env.example" .env.example
cp "$HERE/templates/.env.example" .env.local
cp "$HERE/templates/.gitignore" .gitignore
cp "$HERE/templates/Dockerfile" Dockerfile
cp "$HERE/templates/.dockerignore" .dockerignore

echo ""
echo "✅ $APP ready. Next:"
echo "  1. Fill .env.local with your AI Studio key(s)"
echo "  2. npm run dev  →  check http://localhost:3000/api/health"
echo "  3. npx vercel --prod  (add env vars: npx vercel env add GEMINI_API_KEY)"
