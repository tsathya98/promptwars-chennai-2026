#!/usr/bin/env node
// Batch content/fixture generation on SUBSCRIPTION quota (zero API-key spend).
// Usage:
//   node scripts/agy-batch.mjs "Generate 12 realistic sample records of X as a JSON array" > fixtures/records.json
//   node scripts/agy-batch.mjs --model gemini-3.6-flash-high "Write the landing-page copy for ..."
// Great for: seed data, demo fixtures, marketing copy, PITCH.md drafts.
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
let model = "gemini-3.6-flash-low";
const mi = args.indexOf("--model");
if (mi !== -1) { model = args[mi + 1]; args.splice(mi, 2); }
const prompt = args.join(" ").trim();
if (!prompt) { console.error("usage: agy-batch.mjs [--model <id>] <prompt>"); process.exit(1); }

const out = execFileSync(
  "agy",
  ["-p", prompt, "--model", model, "--sandbox", "--print-timeout", "4m"],
  { encoding: "utf8", timeout: 300_000, maxBuffer: 20 * 1024 * 1024 },
);
process.stdout.write(out.trim().replace(/^```(json)?\s*/i, "").replace(/```\s*$/, "") + "\n");
