"use client";
// Cursor-reactive particle field — full-screen ambient background.
// Ported from agentic-central-reporting's MoleculeCanvas: particles drift,
// connect with thin lines when near, brighten and link to the cursor with a
// smooth lerped follow + radial halo. Pure canvas, zero deps.
// Additions over the original: prefers-reduced-motion + coarse-pointer guards.
import { useEffect, useRef } from "react";

type Props = {
  /** RGB triplets, e.g. "99, 102, 241". Defaults suit a dark UI. */
  particleRGB?: string;
  accentRGB?: string;
  light?: boolean; // flip alphas for light backgrounds
};

export function CursorField({
  particleRGB = "244, 239, 230",
  accentRGB = "122, 243, 208",
  light = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Static fallback for reduced-motion users and touch devices.
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    )
      return;

    const dotBaseA = light ? 0.42 : 0.16;
    const dotPeakA = light ? 1.0 : 0.86;
    const lineMaxA = light ? 0.38 : 0.18;
    const cursorMaxA = light ? 0.8 : 0.55;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999, on: false };
    const target = { x: -9999, y: -9999 };

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let particles: P[] = [];

    const init = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(72, Math.floor((w * h) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() < 0.15 ? 1.6 : 1.0,
      }));
    };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      mouse.on = true;
    };
    const onLeave = () => {
      mouse.on = false;
      target.x = -9999;
      target.y = -9999;
    };

    init();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", init);

    const R = 150, Rsq = R * R, Rc = 220, Rcsq = Rc * Rc;

    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      mouse.x += (target.x - mouse.x) * 0.12; // lerped follow = organic feel
      mouse.y += (target.y - mouse.y) * 0.12;

      for (const p of particles) {
        if (mouse.on) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y, dsq = dx * dx + dy * dy;
          if (dsq < Rcsq) {
            const f = (1 - dsq / Rcsq) * 0.04;
            p.vx += (dx / Math.sqrt(dsq + 0.01)) * f;
            p.vy += (dy / Math.sqrt(dsq + 0.01)) * f;
          }
        }
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;

        const dC = Math.hypot(mouse.x - p.x, mouse.y - p.y);
        const t = Math.max(0, 1 - dC / Rc);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + t * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleRGB}, ${dotBaseA + t * (dotPeakA - dotBaseA)})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dsq = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
          if (dsq < Rsq) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${particleRGB}, ${(1 - dsq / Rsq) * lineMaxA})`;
            ctx.lineWidth = light ? 1.0 : 0.6;
            ctx.stroke();
          }
        }
      }

      if (mouse.on) {
        for (const p of particles) {
          const dsq = (mouse.x - p.x) ** 2 + (mouse.y - p.y) ** 2;
          if (dsq < Rcsq) {
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(${accentRGB}, ${(1 - dsq / Rcsq) * cursorMaxA})`;
            ctx.lineWidth = light ? 1.0 : 0.8;
            ctx.stroke();
          }
        }
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, Rc);
        grad.addColorStop(0, `rgba(${accentRGB}, ${light ? 0.18 : 0.1})`);
        grad.addColorStop(1, `rgba(${accentRGB}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", init);
    };
  }, [particleRGB, accentRGB, light]);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-0 pointer-events-none" aria-hidden />;
}
