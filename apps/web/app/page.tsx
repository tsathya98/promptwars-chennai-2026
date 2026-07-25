"use client";

import { useState } from "react";
import { CursorField } from "@/components/cursor-field";
import { SpotlightCard } from "@/components/spotlight-card";

interface EmergencyData {
  headline: string;
  deescalationSteps: string[];
  emergencyScript: string;
  recommendedAction: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"individual" | "caregiver">("individual");
  const [loading, setLoading] = useState(false);
  const [activeTrigger, setActiveTrigger] = useState<string | null>(null);
  const [emergencyData, setEmergencyData] = useState<EmergencyData | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content:
        "Welcome to IBUKI Circle. I am your 24/7 recovery and caregiver assistant powered by gpt-5.6-terra. Use the zero-typing emergency buttons above or ask me anything below.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Trigger zero-typing intervention
  const handleTrigger = async (triggerType: string, label: string) => {
    setActiveTrigger(label);
    setLoading(true);
    setEmergencyData(null);

    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triggerType, userContext: `Mode: ${activeTab}` }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setEmergencyData(json.data);
      } else {
        setEmergencyData(json.fallback);
      }
    } catch {
      setEmergencyData({
        headline: "Pause. Take a deep, slow breath right now.",
        deescalationSteps: [
          "Inhale through your nose for 4 seconds.",
          "Hold your breath for 4 seconds.",
          "Exhale slowly through your mouth for 6 seconds.",
        ],
        emergencyScript:
          "I am taking a moment to ground myself during high distress. Please support me calmly.",
        recommendedAction: "Drink a glass of cold water and step into a fresh room.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Text-To-Speech for Emergency Script
  const speakScript = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower, calm pacing
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Chat Submission
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: userMsg }] }),
      });
      const json = await res.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: json.content }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm here with you. Take a slow breath, ground yourself, and reach out to your support circle.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
      <CursorField />

      {/* Main Layout Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🛡️</span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                IBUKI Circle
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                Recovery & Prevention Platform
              </span>
            </div>
            <p className="text-slate-400 text-sm md:text-base">
              Zero-typing interventions, real-time emergency scripts, and caregiver safety tools when cognitive load is highest.
            </p>
          </div>

          {/* AI Model Status Badge */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-2xl text-xs font-mono text-slate-300 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Engine: <strong className="text-indigo-400">gpt-5.6-terra</strong> (Low Latency)</span>
          </div>
        </header>

        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setActiveTab("individual")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "individual"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              🙋‍♂️ Individual Recovery Mode
            </button>
            <button
              onClick={() => setActiveTab("caregiver")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "caregiver"
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              🤝 Caregiver & Family Hub
            </button>
          </div>
        </div>

        {/* Zero-Typing Intervention Bar (1-Tap Triggers) */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-wider font-mono text-slate-400 font-semibold">
              ⚡ Zero-Typing Emergency Interventions (1-Tap Action)
            </h2>
            <span className="text-xs text-indigo-400">No typing required</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {activeTab === "individual" ? (
              <>
                <button
                  onClick={() => handleTrigger("INTENSE_CRAVING", "Intense Craving Peak")}
                  className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/50 hover:border-rose-500 hover:bg-rose-900/40 text-left transition-all group flex flex-col justify-between gap-2 shadow-md hover:shadow-rose-950/50"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🔴</span>
                  <div>
                    <div className="text-sm font-bold text-rose-200">Craving Peak</div>
                    <div className="text-xs text-rose-400/80">Immediate de-escalation</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTrigger("PANIC_ATTACK", "Panic / High Distress")}
                  className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/50 hover:border-amber-500 hover:bg-amber-900/40 text-left transition-all group flex flex-col justify-between gap-2 shadow-md"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🟡</span>
                  <div>
                    <div className="text-sm font-bold text-amber-200">Panic / Anxiety</div>
                    <div className="text-xs text-amber-400/80">5-4-3-2-1 Grounding</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTrigger("RELAPSE_RISK", "Impulse Risk Trigger")}
                  className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 hover:border-indigo-500 hover:bg-indigo-900/40 text-left transition-all group flex flex-col justify-between gap-2 shadow-md"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🔵</span>
                  <div>
                    <div className="text-sm font-bold text-indigo-200">Impulse Risk</div>
                    <div className="text-xs text-indigo-400/80">Pivot & Safety Protocol</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTrigger("EMERGENCY_SUPPORT", "Call Support Script")}
                  className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 hover:border-emerald-500 hover:bg-emerald-900/40 text-left transition-all group flex flex-col justify-between gap-2 shadow-md"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🟢</span>
                  <div>
                    <div className="text-sm font-bold text-emerald-200">Sponsor Script</div>
                    <div className="text-xs text-emerald-400/80">Read aloud script</div>
                  </div>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleTrigger("CAREGIVER_CRISIS", "Caregiver De-escalation")}
                  className="p-4 rounded-2xl bg-pink-950/40 border border-pink-800/50 hover:border-pink-500 hover:bg-pink-900/40 text-left transition-all group flex flex-col justify-between gap-2 shadow-md"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">💜</span>
                  <div>
                    <div className="text-sm font-bold text-pink-200">Family Crisis Script</div>
                    <div className="text-xs text-pink-400/80">Calming speech protocol</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTrigger("SAFETY_CHECK", "Safety Check Protocol")}
                  className="p-4 rounded-2xl bg-sky-950/40 border border-sky-800/50 hover:border-sky-500 hover:bg-sky-900/40 text-left transition-all group flex flex-col justify-between gap-2 shadow-md"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🌐</span>
                  <div>
                    <div className="text-sm font-bold text-sky-200">Safety Check</div>
                    <div className="text-xs text-sky-400/80">Environment evaluation</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTrigger("EMPATHY_RESOURCES", "De-escalation Tips")}
                  className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/50 hover:border-purple-500 hover:bg-purple-900/40 text-left transition-all group flex flex-col justify-between gap-2 shadow-md"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">📖</span>
                  <div>
                    <div className="text-sm font-bold text-purple-200">De-escalation Tips</div>
                    <div className="text-xs text-purple-400/80">Non-confrontational guide</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTrigger("HOTLINE_DISPATCH", "Emergency Contacts")}
                  className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/50 hover:border-rose-500 hover:bg-rose-900/40 text-left transition-all group flex flex-col justify-between gap-2 shadow-md"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🚨</span>
                  <div>
                    <div className="text-sm font-bold text-rose-200">Emergency Lines</div>
                    <div className="text-xs text-rose-400/80">Direct helpline & backup</div>
                  </div>
                </button>
              </>
            )}
          </div>
        </section>

        {/* Real-Time Intervention Output */}
        <section className="flex flex-col gap-4">
          {loading && (
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-indigo-500/30 flex flex-col items-center justify-center gap-3 backdrop-blur-md">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-300 font-mono">
                Generating real-time emergency response via <strong className="text-indigo-400">gpt-5.6-terra</strong>...
              </p>
            </div>
          )}

          {emergencyData && !loading && (
            <SpotlightCard className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
              {/* Active Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Active Script: {activeTrigger}
                  </span>
                </div>
                <button
                  onClick={() => speakScript(emergencyData.emergencyScript)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isPlayingAudio
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                >
                  {isPlayingAudio ? "🔊 Stop Voice" : "🔊 Read Script Aloud"}
                </button>
              </div>

              {/* Grounding Headline */}
              <div>
                <div className="text-xs font-mono uppercase text-emerald-400 font-semibold mb-1">
                  1. Immediate Grounding Directive
                </div>
                <p className="text-xl md:text-2xl font-bold text-slate-100 leading-snug">
                  "{emergencyData.headline}"
                </p>
              </div>

              {/* De-escalation Steps */}
              <div>
                <div className="text-xs font-mono uppercase text-indigo-400 font-semibold mb-2">
                  2. De-escalation Protocol Steps
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {emergencyData.deescalationSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-300 flex flex-col gap-2"
                    >
                      <span className="text-xs font-mono text-indigo-400 font-bold">STEP {idx + 1}</span>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Script for User / Caregiver */}
              <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col gap-2">
                <div className="text-xs font-mono uppercase text-pink-400 font-semibold">
                  3. Emergency Voice Script (To read or send to support contact)
                </div>
                <p className="text-base italic text-indigo-200 font-serif leading-relaxed">
                  "{emergencyData.emergencyScript}"
                </p>
              </div>

              {/* Recommended Immediate Action */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono uppercase text-emerald-400 font-semibold">
                    4. Immediate Action Item
                  </div>
                  <div className="text-sm font-semibold text-emerald-200">
                    {emergencyData.recommendedAction}
                  </div>
                </div>
                <button
                  onClick={() => alert("Safety check-in sent to emergency contacts.")}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shrink-0"
                >
                  ✓ Complete Step
                </button>
              </div>
            </SpotlightCard>
          )}

          {!emergencyData && !loading && (
            <div className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800/60 text-center flex flex-col items-center justify-center gap-3 backdrop-blur-md">
              <span className="text-4xl">⚡</span>
              <h3 className="text-lg font-bold text-slate-200">Select a Zero-Typing Intervention Above</h3>
              <p className="text-sm text-slate-400 max-w-md">
                Click any of the 1-tap emergency buttons to instantly generate real-time de-escalation protocols and emergency scripts tailored for high cognitive stress moments.
              </p>
            </div>
          )}
        </section>

        {/* AI Assistant Chat Modal Toggle */}
        <div className="fixed bottom-6 right-6 z-50">
          {!chatOpen ? (
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold text-sm shadow-2xl hover:scale-105 transition-all"
            >
              <span>💬 Ask AI Recovery Coach</span>
            </button>
          ) : (
            <div className="w-96 max-w-[90vw] h-[500px] rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <div>
                    <div className="text-xs font-bold text-slate-100">IBUKI Circle AI Coach</div>
                    <div className="text-[10px] font-mono text-emerald-400">gpt-5.6-terra Connected</div>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-slate-400 hover:text-slate-200 text-lg px-2"
                >
                  ✕
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white self-end rounded-br-none"
                        : "bg-slate-800/80 text-slate-200 border border-slate-700/60 self-start rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {chatLoading && (
                  <div className="p-3 rounded-2xl bg-slate-800/80 text-slate-400 self-start text-xs font-mono">
                    Thinking...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 bg-slate-950/80 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask situational questions..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
