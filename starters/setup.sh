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
mkdir -p components fixtures
cp "$HERE/templates/components/widget-renderer.tsx" components/

cat > .env.local <<'EOF'
GEMINI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
GEMINI_API_KEY_FALLBACK=
MOCK=0
EOF

echo ""
echo "✅ $APP ready. Next:"
echo "  1. Fill .env.local with your AI Studio key(s)"
echo "  2. npm run dev  →  check http://localhost:3000/api/health"
echo "  3. npx vercel --prod  (add env vars: npx vercel env add GEMINI_API_KEY)"
