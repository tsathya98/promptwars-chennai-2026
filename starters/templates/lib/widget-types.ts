// Closed-vocabulary widget tree (SDUI). The model authors SECTION SPECS;
// server code compiles them into this tree; WidgetRenderer draws it.
import { z } from "zod";

export type WidgetNode =
  | { type: "card"; title?: string; children: WidgetNode[] }
  | { type: "row"; children: WidgetNode[] }
  | { type: "col"; children: WidgetNode[] }
  | { type: "title"; text: string }
  | { type: "text"; text: string; muted?: boolean }
  | { type: "badge"; text: string; tone?: "ok" | "warn" | "bad" | "info" }
  | { type: "kpi"; label: string; value: string; delta?: string; insight?: string }
  | { type: "chart"; kind: "line" | "bar" | "area" | "pie"; title?: string;
      data: Record<string, string | number>[]; xKey: string; yKeys: string[] }
  | { type: "table"; columns: string[]; rows: (string | number | null)[][] };

// What the MODEL returns (via generateObject) — small, semantic, verifiable.
export const sectionSpecSchema = z.object({
  sections: z.array(
    z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("kpi"), label: z.string(), query: z.string() }),
      z.object({ kind: z.literal("trend"), title: z.string(), query: z.string() }),
      z.object({ kind: z.literal("compare"), title: z.string(), query: z.string() }),
      z.object({ kind: z.literal("table"), title: z.string(), query: z.string() }),
      z.object({ kind: z.literal("note"), markdown: z.string() }),
    ]),
  ),
});
export type SectionSpec = z.infer<typeof sectionSpecSchema>["sections"][number];

// compileSections(specs) -> { widget, emptySections } lives in lib/compiler.ts —
// it runs the queries against YOUR data source and builds the WidgetNode tree.
// ALWAYS return emptySections so the model can verify instead of hallucinate.
