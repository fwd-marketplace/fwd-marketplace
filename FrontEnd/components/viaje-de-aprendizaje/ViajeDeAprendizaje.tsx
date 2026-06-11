"use client";

import "./viaje.css";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Star, CelebrationData, Transform } from "./data/types";
import { STARS } from "./data/stars";
import { CONSTELLATIONS } from "./data/constellations";
import { BOARD, EDGES, META } from "./data/edges";
import { recompute } from "./utils";
import { Sky } from "./sky/Sky";
import { HeaderBar } from "./ui/HeaderBar";
import { GoalBar } from "./ui/GoalBar";
import { Legend } from "./ui/Legend";
import { ZoomControls } from "./ui/ZoomControls";
import { DetailPanel } from "./ui/DetailPanel";
import { Celebration } from "./ui/Celebration";

const TWEAKS = {
  starShape: "diamond",
  pathStyle: "dotted",
  stateStyle: "multicolor",
  density: "rich",
} as const;

function Starfield() {
  const dots = useMemo(() => {
    const arr: { x: number; y: number; s: number; o: number; d: number }[] = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < 70; i++) {
      arr.push({ x: rnd() * 100, y: rnd() * 100, s: 1 + rnd() * 2.2, o: 0.15 + rnd() * 0.5, d: rnd() * 5000 });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white star-dot-twinkle"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.s,
            height: d.s,
            opacity: d.o,
            animationDelay: `${d.d}ms`,
            "--twinkle-opacity": d.o,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export function ViajeDeAprendizaje() {
  const router = useRouter();

  const [stars, setStars] = useState<Star[]>(() =>
    recompute(STARS.map((s) => ({ ...s })), EDGES),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [celeb, setCeleb] = useState<CelebrationData | null>(null);
  const [xp, setXp] = useState<number>(() =>
    STARS.filter((s) => s.state === "done").reduce((acc, s) => acc + s.mastery * 100, 0),
  );

  const progress = useMemo(() => ({
    lit: stars.filter((s) => s.state === "done").length,
    total: stars.length,
  }), [stars]);

  const nextStar = useMemo(() => stars.find((s) => s.state === "available") ?? null, [stars]);
  const selected = stars.find((s) => s.id === selectedId) ?? null;

  /* ── pan / zoom ─────────────────────────────────────────────────────── */
  const [tf, setTf] = useState<Transform>({ x: 0, y: 0, scale: 0.5 });
  const [isDragging, setIsDragging] = useState(false);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const minScaleRef = useRef(0.18);

  const clamp = useCallback((nx: number, ny: number, scale: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 160;
    return {
      x: Math.max(Math.min(nx, margin), vw - BOARD.w * scale - margin),
      y: Math.max(Math.min(ny, margin), vh - BOARD.h * scale - margin),
    };
  }, []);

  const fitAll = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Star content bounding box (x:80–1470, y:50–980) with UI padding
    const contentW = 1390;
    const contentH = 930;
    const contentOffsetX = 80;
    const contentOffsetY = 50;
    const padH = 80;
    const padV = vw < 760 ? 160 : 200;
    const raw = Math.min((vw - padH) / contentW, (vh - padV) / contentH);
    const s = Math.max(Math.min(raw, 1), 0.1);
    minScaleRef.current = s;
    setTf({
      x: (vw - contentW * s) / 2 - contentOffsetX * s,
      y: (vh - contentH * s) / 2 - contentOffsetY * s + 10,
      scale: s,
    });
  }, []);

  useEffect(() => { fitAll(); }, [fitAll]);
  useEffect(() => {
    window.addEventListener("resize", fitAll);
    return () => window.removeEventListener("resize", fitAll);
  }, [fitAll]);

  const canZoomOut = tf.scale > minScaleRef.current + 0.01;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest("[data-star]")) return;
    drag.current = { sx: e.clientX, sy: e.clientY, ox: tf.x, oy: tf.y, moved: false };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.sx;
    const dy = e.clientY - drag.current.sy;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.current.moved = true;
    const c = clamp(drag.current.ox + dx, drag.current.oy + dy, tf.scale);
    setTf((p) => ({ ...p, x: c.x, y: c.y }));
  };

  const onPointerUp = () => {
    const wasDrag = drag.current;
    drag.current = null;
    setIsDragging(false);
    if (wasDrag && !wasDrag.moved) setSelectedId(null);
  };

  const zoom = (factor: number) => {
    setTf((p) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ns = Math.max(Math.min(p.scale * factor, 1.5), minScaleRef.current);
      if (ns === p.scale) return p;
      const bx = (vw / 2 - p.x) / p.scale;
      const by = (vh / 2 - p.y) / p.scale;
      const c = clamp(vw / 2 - bx * ns, vh / 2 - by * ns, ns);
      return { x: c.x, y: c.y, scale: ns };
    });
  };

  const centerOn = useCallback((x: number, y: number) => {
    setTf((p) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw < 760;
      const targetX = isMobile ? vw / 2 : (vw - 412) / 2;
      const targetY = isMobile ? vh * 0.32 : vh * 0.46;
      const c = clamp(targetX - x * p.scale, targetY - y * p.scale, p.scale);
      return { ...p, x: c.x, y: c.y };
    });
  }, [clamp]);

  /* ── acciones ────────────────────────────────────────────────────────── */
  const openFromGoal = (id: string) => {
    const s = stars.find((x) => x.id === id);
    if (s) centerOn(s.x, s.y);
    setTimeout(() => setSelectedId(id), 60);
  };

  const lightStar = (id: string) => {
    const s = stars.find((x) => x.id === id);
    if (!s) return;
    setSelectedId(null);
    const lit: Star = { ...s, state: "done", mastery: 1, unlockedDate: "hoy" };
    setCeleb({ star: lit, area: CONSTELLATIONS[s.area]!, xpGain: 100 });
    setStars((prev) => recompute(prev.map((x) => (x.id === id ? lit : x)), EDGES));
    setXp((v) => v + 100);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-secondary overflow-hidden">
      {/* franjas decorativas — fijas, siempre pegadas al borde derecho */}
      <svg
        className="absolute right-0 top-0 h-full pointer-events-none"
        style={{ width: "clamp(160px, 28vw, 420px)" }}
        viewBox="0 0 420 800"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
      >
        <polygon points="80,-10 200,-10 340,400 200,810 80,810 220,400"  fill="rgba(255,255,255,0.04)" />
        <polygon points="200,-10 320,-10 460,400 320,810 200,810 340,400" fill="rgba(255,255,255,0.07)" />
        <polygon points="310,-10 430,-10 570,400 430,810 310,810 450,400" fill="rgba(255,255,255,0.10)" />
      </svg>

      <Starfield />

      {/* canvas paneable */}
      <div
        className={`absolute inset-0 overflow-hidden touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "0 0",
            transform: `translate(${tf.x}px, ${tf.y}px) scale(${tf.scale})`,
            transition: isDragging ? "none" : "transform 320ms cubic-bezier(0.23, 1, 0.32, 1)",
            willChange: "transform",
          }}
        >
          <Sky
            stars={stars}
            tweaks={TWEAKS}
            selectedId={selectedId}
            onSelectStar={setSelectedId}
          />
        </div>
      </div>

      <HeaderBar
        progress={progress}
        xp={xp}
        streak={META.streakDays}
        level={META.level}
        onBack={() => router.back()}
      />

      <Legend />
      <ZoomControls onIn={() => zoom(1.25)} onOut={() => zoom(0.8)} onFit={fitAll} canZoomOut={canZoomOut} />
      <GoalBar nextStar={nextStar} area={nextStar ? (CONSTELLATIONS[nextStar.area] ?? null) : null} onOpen={openFromGoal} />

      {selected && (
        <DetailPanel
          star={selected}
          area={CONSTELLATIONS[selected.area]!}
          onClose={() => setSelectedId(null)}
          onLight={lightStar}
        />
      )}

      {celeb && (
        <Celebration star={celeb.star} area={celeb.area} xpGain={celeb.xpGain} onDone={() => setCeleb(null)} />
      )}
    </div>
  );
}
