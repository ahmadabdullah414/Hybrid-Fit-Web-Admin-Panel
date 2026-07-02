"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pulsePhase: number;
}

/**
 * The signature dark/red moving-particle backdrop, styled after
 * D:\Profession\Asset-Manager-1\artifacts\portfolio's CursorBackground —
 * a field of slow-drifting nodes connected by faint lines, with a subtle
 * cursor glow and a light particle trail on mouse movement. Deliberately
 * capped (node count, connection distance) so it never drops frames.
 */
export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -999, y: -999 });
  const particles = useRef<Particle[]>([]);
  const nodes = useRef<Node[]>([]);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const initNodes = () => {
      const count = Math.min(70, Math.floor((canvas.width * canvas.height) / (28000 * dpr * dpr)));
      nodes.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3 * dpr,
        vy: (Math.random() - 0.5) * 0.3 * dpr,
        pulsePhase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      initNodes();
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX * dpr, y: e.clientY * dpr };
      if (Math.random() > 0.5) return;
      particles.current.push({
        x: e.clientX * dpr + (Math.random() - 0.5) * 12,
        y: e.clientY * dpr + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 2.2 * dpr,
        vy: ((Math.random() - 0.5) * 2.2 - 0.4) * dpr,
        life: 1,
        size: (Math.random() * 2.6 + 1) * dpr,
      });
    };

    const onMouseLeave = () => {
      mouse.current = { x: -999, y: -999 };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mouse.current.x > 0) {
        const g = ctx.createRadialGradient(mouse.current.x, mouse.current.y, 0, mouse.current.x, mouse.current.y, 220 * dpr);
        g.addColorStop(0, "rgba(237,50,55,0.08)");
        g.addColorStop(1, "rgba(237,50,55,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const ns = nodes.current;
      const maxDist = 130 * dpr;
      const mouseAttract = 220 * dpr;

      for (let i = 0; i < ns.length; i++) {
        const n = ns[i];
        const dx = mouse.current.x - n.x;
        const dy = mouse.current.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseAttract) {
          const force = (1 - dist / mouseAttract) * 0.012;
          n.vx += dx * force * 0.01;
          n.vy += dy * force * 0.01;
        }

        n.vx *= 0.98;
        n.vy *= 0.98;
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        n.x = Math.max(0, Math.min(canvas.width, n.x));
        n.y = Math.max(0, Math.min(canvas.height, n.y));

        n.pulsePhase += 0.015;
        const alpha = 0.15 + 0.1 * Math.sin(n.pulsePhase);
        const nearMouse = dist < 110 * dpr;

        ctx.beginPath();
        ctx.arc(n.x, n.y, (nearMouse ? 2.4 : 1.5) * dpr, 0, Math.PI * 2);
        ctx.fillStyle = nearMouse ? `rgba(255,60,60,${alpha + 0.2})` : `rgba(180,30,30,${alpha})`;
        ctx.fill();

        for (let j = i + 1; j < ns.length; j++) {
          const m = ns[j];
          const edx = m.x - n.x;
          const edy = m.y - n.y;
          const edist = Math.sqrt(edx * edx + edy * edy);
          if (edist < maxDist) {
            const opacity = (1 - edist / maxDist) * 0.16;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(120,20,20,${opacity})`;
            ctx.lineWidth = 0.5 * dpr;
            ctx.stroke();
          }
        }
      }

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05 * dpr;
        p.life -= 0.025;
        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life * 0.8;
        ctx.fillStyle = "rgb(237,50,55)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ mixBlendMode: "screen" }}
      aria-hidden
    />
  );
}
