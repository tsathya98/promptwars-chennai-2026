"use client";

import { useEffect, useRef, useState } from "react";
import { AudioLines, MicOff, Mic, PhoneOff, RotateCcw } from "lucide-react";

type SessionState = "idle" | "connecting" | "live" | "error";

type Props = {
  mode: "individual" | "caregiver";
  language?: string;
  onClose: () => void;
};

/**
 * IBUKI Voice — speech-to-speech companion over WebRTC (OpenAI Realtime).
 * The browser only ever holds a short-lived ephemeral token minted by
 * /api/realtime/token; raw audio is never recorded or stored by the app.
 * Explicit states only — a failed connection says so and falls back to the
 * one-tap buttons, which always work.
 */
export function LiveVoice({ mode, language = "en", onClose }: Props) {
  const [state, setState] = useState<SessionState>("idle");
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanup = () => {
    micRef.current?.getTracks().forEach((t) => t.stop());
    micRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
  };

  useEffect(() => cleanup, []);

  const connect = async () => {
    setState("connecting");
    setTranscript("");
    try {
      const tokenRes = await fetch("/api/realtime/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, language }),
      });
      if (!tokenRes.ok) throw new Error("token");
      const { value, baseUrl, model } = (await tokenRes.json()) as {
        value: string;
        baseUrl: string;
        model: string;
      };

      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      micRef.current = mic;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      pc.ontrack = (e) => {
        if (audioRef.current) audioRef.current.srcObject = e.streams[0];
      };
      for (const track of mic.getTracks()) pc.addTrack(track, mic);

      const dc = pc.createDataChannel("oai-events");
      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data as string) as {
            type?: string;
            delta?: string;
            transcript?: string;
          };
          const type = String(event.type ?? "");
          if (type.includes("output_audio_transcript")) {
            if (type.endsWith(".delta") && typeof event.delta === "string") {
              setTranscript((t) => (t + event.delta).slice(-400));
            } else if (type.endsWith(".done") && typeof event.transcript === "string") {
              setTranscript(event.transcript.slice(-400));
            }
          }
        } catch {
          /* non-JSON events are ignored */
        }
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "disconnected"].includes(pc.connectionState)) {
          cleanup();
          setState("error");
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpRes = await fetch(`${baseUrl}/realtime/calls?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: { Authorization: `Bearer ${value}`, "Content-Type": "application/sdp" },
      });
      if (!sdpRes.ok) throw new Error("sdp");
      await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });
      setState("live");
    } catch {
      cleanup();
      setState("error");
    }
  };

  const toggleMute = () => {
    const next = !muted;
    micRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !next;
    });
    setMuted(next);
  };

  const end = () => {
    cleanup();
    setMuted(false);
    setState("idle");
    onClose();
  };

  return (
    <section
      aria-label="IBUKI Voice live session"
      className="surface flex flex-col gap-3 border-[var(--indigo)]/40 p-4"
    >
      {/* Hidden sink for the model's audio track */}
      <audio ref={audioRef} autoPlay className="hidden" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-bold text-[var(--indigo)]">
          <AudioLines className="h-4 w-4" aria-hidden />
          IBUKI Voice — live conversation
          <span
            aria-hidden
            className={`ml-1 h-2 w-2 rounded-full ${
              state === "live"
                ? "dot-working bg-[var(--indigo)]"
                : state === "connecting"
                  ? "dot-working bg-[var(--amber)]"
                  : "bg-[var(--line-hi)]"
            }`}
          />
        </p>
        <p className="text-xs text-[var(--text-soft)]" role="status">
          {state === "idle" && "Not connected"}
          {state === "connecting" && "Connecting…"}
          {state === "live" && (muted ? "Muted — it can't hear you" : "Listening — just speak; you can interrupt")}
          {state === "error" && "Couldn't connect — the buttons below always work"}
        </p>
      </div>

      {transcript && (
        <p className="text-sm italic leading-relaxed text-[var(--text-soft)]" aria-live="polite">
          “{transcript}”
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {state === "idle" && (
          <button
            type="button"
            onClick={connect}
            className="flex min-h-12 items-center gap-2 rounded-xl bg-[var(--indigo)]/15 px-5 text-sm font-bold text-[var(--indigo)] hover:bg-[var(--indigo)]/25"
          >
            <Mic className="h-4 w-4" aria-hidden />
            Start voice conversation
          </button>
        )}
        {state === "error" && (
          <button
            type="button"
            onClick={connect}
            className="flex min-h-12 items-center gap-2 rounded-xl bg-[var(--indigo)]/15 px-5 text-sm font-bold text-[var(--indigo)] hover:bg-[var(--indigo)]/25"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        )}
        {state === "live" && (
          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={muted}
            className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--line)] px-5 text-sm font-semibold text-[var(--text-soft)] hover:border-[var(--line-hi)]"
          >
            {muted ? <Mic className="h-4 w-4" aria-hidden /> : <MicOff className="h-4 w-4" aria-hidden />}
            {muted ? "Unmute" : "Mute"}
          </button>
        )}
        {(state === "live" || state === "connecting") && (
          <button
            type="button"
            onClick={end}
            className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--crisis)]/40 px-5 text-sm font-semibold text-[var(--crisis-soft)] hover:bg-[var(--crisis)]/10"
          >
            <PhoneOff className="h-4 w-4" aria-hidden />
            End
          </button>
        )}
        {(state === "idle" || state === "error") && (
          <button
            type="button"
            onClick={end}
            className="flex min-h-12 items-center rounded-xl border border-[var(--line)] px-5 text-sm font-semibold text-[var(--text-soft)] hover:border-[var(--line-hi)]"
          >
            Close
          </button>
        )}
      </div>
      <p className="text-xs text-[var(--text-soft)] opacity-75">
        Speech-to-speech via gpt-realtime. In an emergency, say so — it will point you to 112 and
        the Emergency button. Audio is processed live, never stored by IBUKI.
      </p>
    </section>
  );
}
