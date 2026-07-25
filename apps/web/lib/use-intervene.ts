"use client";

import { useCallback, useRef, useState } from "react";
import type {
  ActivityEvent,
  AgentResponse,
  InterveneFrame,
  InterveneRequest,
} from "./schemas";

export type InterveneStatus = "idle" | "working" | "done" | "error";

function upsert(events: ActivityEvent[], event: ActivityEvent): ActivityEvent[] {
  const idx = events.findIndex((e) => e.id === event.id);
  if (idx === -1) return [...events, event];
  const next = events.slice();
  next[idx] = event;
  return next;
}

/**
 * Client for POST /api/intervene. Reads the NDJSON stream frame by frame so
 * the activity rail updates live while generation is still running.
 */
export function useIntervene() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [status, setStatus] = useState<InterveneStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setEvents([]);
    setResponse(null);
    setError(null);
    setStatus("idle");
  }, []);

  const intervene = useCallback(async (request: InterveneRequest) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setEvents([]);
    setResponse(null);
    setError(null);
    setStatus("working");

    try {
      const res = await fetch("/api/intervene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) {
        const detail = await res.json().catch(() => null);
        throw new Error(
          (detail as { error?: string } | null)?.error ?? `Request failed (${res.status})`,
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sawResponse = false;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineAt: number;
        while ((newlineAt = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, newlineAt).trim();
          buffer = buffer.slice(newlineAt + 1);
          if (!line) continue;
          const frame = JSON.parse(line) as InterveneFrame;
          if (frame.type === "activity") {
            setEvents((prev) => upsert(prev, frame.event));
          } else if (frame.type === "response") {
            sawResponse = true;
            setResponse(frame.response);
            setStatus("done");
            // Honest client-side stage: widgets are about to mount here.
            setEvents((prev) => [
              ...prev,
              {
                id: `render-${Date.now().toString(36)}`,
                stage: "rendering",
                label: `${frame.response.widgets.length} widgets rendered on your device`,
                status: "complete",
                ts: Date.now(),
              },
            ]);
          } else {
            setError(frame.message);
            setStatus("error");
          }
        }
      }
      if (!sawResponse) {
        setStatus((s) => (s === "working" ? "error" : s));
        setError((e) => e ?? "The response stream ended early. Please try again.");
      }
    } catch (err) {
      if (ac.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Network error — please try again.");
      setStatus("error");
    }
  }, []);

  return { events, response, status, error, intervene, reset };
}
