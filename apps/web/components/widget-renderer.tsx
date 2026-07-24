"use client";
// Tiny recursive SDUI renderer — closed vocabulary, never grows on the client.
// New visuals = new server-side compiler output, not new React code.
import type { WidgetNode } from "@/lib/widget-types";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];
const tone: Record<string, string> = {
  ok: "bg-green-100 text-green-800", warn: "bg-amber-100 text-amber-800",
  bad: "bg-red-100 text-red-800", info: "bg-blue-100 text-blue-800",
};

export function WidgetRenderer({ node }: { node: WidgetNode }) {
  switch (node.type) {
    case "card":
      return (
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-900">
          {node.title && <h3 className="mb-3 font-semibold">{node.title}</h3>}
          {node.children.map((c, i) => <WidgetRenderer key={i} node={c} />)}
        </div>
      );
    case "row":
      return <div className="flex flex-wrap gap-4">{node.children.map((c, i) => <div key={i} className="min-w-48 flex-1"><WidgetRenderer node={c} /></div>)}</div>;
    case "col":
      return <div className="flex flex-col gap-4">{node.children.map((c, i) => <WidgetRenderer key={i} node={c} />)}</div>;
    case "title":
      return <h2 className="text-lg font-bold">{node.text}</h2>;
    case "text":
      return <p className={node.muted ? "text-sm text-zinc-500" : "text-sm"}>{node.text}</p>;
    case "badge":
      return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone[node.tone ?? "info"]}`}>{node.text}</span>;
    case "kpi":
      return (
        <div className="rounded-lg border p-3">
          <div className="text-xs text-zinc-500">{node.label}</div>
          <div className="text-2xl font-bold">{node.value}</div>
          {node.delta && <div className="text-xs text-zinc-500">{node.delta}</div>}
          {node.insight && <div className="mt-1 text-xs">{node.insight}</div>}
        </div>
      );
    case "chart": {
      const H = 220;
      const axes = (
        <>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis dataKey={node.xKey} fontSize={11} /> <YAxis fontSize={11} /> <Tooltip />
        </>
      );
      return (
        <div>
          {node.title && <div className="mb-1 text-sm font-medium">{node.title}</div>}
          <ResponsiveContainer width="100%" height={H}>
            {node.kind === "line" ? (
              <LineChart data={node.data}>{axes}{node.yKeys.map((k, i) => <Line key={k} dataKey={k} stroke={COLORS[i % COLORS.length]} dot={false} />)}</LineChart>
            ) : node.kind === "bar" ? (
              <BarChart data={node.data}>{axes}{node.yKeys.map((k, i) => <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} />)}</BarChart>
            ) : node.kind === "area" ? (
              <AreaChart data={node.data}>{axes}{node.yKeys.map((k, i) => <Area key={k} dataKey={k} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.2} />)}</AreaChart>
            ) : (
              <PieChart><Tooltip /><Pie data={node.data} dataKey={node.yKeys[0]} nameKey={node.xKey} label>{node.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie></PieChart>
            )}
          </ResponsiveContainer>
        </div>
      );
    }
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left">{node.columns.map((c) => <th key={c} className="p-2 font-medium">{c}</th>)}</tr></thead>
            <tbody>{node.rows.map((r, i) => <tr key={i} className="border-b last:border-0">{r.map((cell, j) => <td key={j} className="p-2">{cell ?? "—"}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    default:
      // Visible red block beats silent drop — you'll catch it before the judges do.
      return <div className="rounded bg-red-100 p-2 text-xs text-red-700">unknown widget: {JSON.stringify(node).slice(0, 80)}</div>;
  }
}
