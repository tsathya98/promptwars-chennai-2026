"use client";

/**
 * Connector Library — controlled real-world actions. Every connector returns
 * only observable states: the UI may say a composer/dialer "opened" or a
 * message was "prepared" (copied), never that anything was sent, delivered,
 * or completed. Raw audio, coordinates, and message contents never reach our
 * server — these run entirely in the browser.
 */
export type ConnectorResult = {
  status: "prepared" | "opened" | "failed";
  message: string;
  retryable: boolean;
};

/* ---------- Pure link builders (unit-tested, no browser APIs) ---------- */

export const buildTelLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export const buildSmsLink = (body: string) => `sms:?&body=${encodeURIComponent(body)}`;

export const buildWhatsAppLink = (body: string) =>
  `https://wa.me/?text=${encodeURIComponent(body)}`;

export const buildMapsLink = (lat: number, lng: number) =>
  `https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)}`;

/* ---------- Browser connectors ---------- */

export function openPhone(phone: string, label?: string): ConnectorResult {
  window.location.href = buildTelLink(phone);
  return {
    status: "opened",
    message: `Dialer opened with ${label ?? phone} — the call is in your hands.`,
    retryable: true,
  };
}

export function openSms(body: string): ConnectorResult {
  window.location.href = buildSmsLink(body);
  return { status: "opened", message: "SMS composer opened — review and send.", retryable: true };
}

export function openWhatsApp(body: string): ConnectorResult {
  window.open(buildWhatsAppLink(body), "_blank", "noopener,noreferrer");
  return { status: "opened", message: "WhatsApp opened — review and send.", retryable: true };
}

export async function shareText(text: string): Promise<ConnectorResult> {
  try {
    if (typeof navigator.share === "function") {
      await navigator.share({ text });
      return { status: "opened", message: "Share sheet opened.", retryable: true };
    }
    return await copyText(text);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { status: "prepared", message: "Share cancelled — nothing was sent.", retryable: true };
    }
    return { status: "failed", message: "Couldn't open the share sheet.", retryable: true };
  }
}

export async function copyText(text: string): Promise<ConnectorResult> {
  try {
    await navigator.clipboard.writeText(text);
    return { status: "prepared", message: "Message copied — paste it anywhere.", retryable: true };
  } catch {
    return { status: "failed", message: "Couldn't copy. Select the text manually.", retryable: true };
  }
}

/** Location consent happens at the moment of use; the link goes into the message the USER sends. */
export function requestLocationLink(): Promise<ConnectorResult & { link?: string }> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve({ status: "failed", message: "Location isn't available on this device.", retryable: false });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          status: "prepared",
          message: "Location link added to your message — you choose whether to send it.",
          retryable: true,
          link: buildMapsLink(pos.coords.latitude, pos.coords.longitude),
        }),
      () =>
        resolve({
          status: "failed",
          message: "Location permission was declined — your message still works without it.",
          retryable: true,
        }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  });
}

/* ---------- Speech (audio never recorded or stored by the app) ---------- */

let activeAudio: HTMLAudioElement | null = null;
let activeUrl: string | null = null;

/**
 * Natural read-aloud: server TTS (calm, steerable voice) with browser
 * speechSynthesis as the honest fallback when the request fails.
 */
export async function speak(
  text: string,
  opts: { lang?: string; language?: string; onEnd?: () => void } = {},
): Promise<ConnectorResult> {
  const { onEnd } = opts;
  stopSpeaking();
  try {
    const res = await fetch("/api/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 800), language: opts.language }),
    });
    if (!res.ok) throw new Error(`speech ${res.status}`);
    const url = URL.createObjectURL(await res.blob());
    const audio = new Audio(url);
    activeAudio = audio;
    activeUrl = url;
    const finish = () => {
      if (activeUrl === url) {
        URL.revokeObjectURL(url);
        activeAudio = null;
        activeUrl = null;
      }
      onEnd?.();
    };
    audio.onended = finish;
    audio.onerror = finish;
    await audio.play();
    return { status: "opened", message: "Reading aloud.", retryable: true };
  } catch {
    return speakWithBrowser(text, opts);
  }
}

function speakWithBrowser(
  text: string,
  opts: { lang?: string; onEnd?: () => void } = {},
): ConnectorResult {
  const { lang = "en-IN", onEnd } = opts;
  if (!("speechSynthesis" in window)) {
    return { status: "failed", message: "Read-aloud isn't supported in this browser.", retryable: false };
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // calm pacing
  utterance.pitch = 1.0;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
  return { status: "opened", message: "Reading aloud.", retryable: true };
}

export function stopSpeaking() {
  if (activeAudio) {
    activeAudio.onended = null;
    activeAudio.onerror = null;
    activeAudio.pause();
    if (activeUrl) URL.revokeObjectURL(activeUrl);
    activeAudio = null;
    activeUrl = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
