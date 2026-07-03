"use client";

import "./viaje.css";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Star, CelebrationData, Transform } from "./data/types";
import type { ApiRoleName } from "@/lib/api/types";
import { STARS } from "./data/stars";
import { CONSTELLATIONS } from "./data/constellations";
import { EDGES, META } from "./data/edges";
import { recompute } from "./utils";
import { getProgressAction, putProgressAction } from "@/lib/actions/viaje";
import type { ProgressRow } from "@/lib/api/viaje";
import { Sky } from "./sky/Sky";
import { HeaderBar } from "./ui/HeaderBar";
import { GoalBar } from "./ui/GoalBar";
import { Legend } from "./ui/Legend";
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

function mergeProgress(rows: ProgressRow[]): Star[] {
  const doneMap = new Map(rows.map((r) => [r.star_id, r.mastery]));
  const merged = STARS.map((s) => {
    const mastery = doneMap.get(s.id);
    if (mastery !== undefined) {
      return { ...s, state: "done" as const, mastery, unlockedDate: "hoy" };
    }
    return { ...s, state: "locked" as const, mastery: 0 };
  });
  return recompute(merged, EDGES);
}

interface ViajeDeAprendizajeProps {
  userName?: string | undefined;
  avatarUrl?: string | undefined;
  role?: ApiRoleName | undefined;
}

export function ViajeDeAprendizaje({ userName, avatarUrl, role }: ViajeDeAprendizajeProps) {
  const [stars, setStars] = useState<Star[]>(() => STARS.map((s) => ({ ...s })));
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [celeb, setCeleb] = useState<CelebrationData | null>(null);
  const [xp, setXp] = useState<number>(META.initialXp);

  const progress = useMemo(() => ({
    lit: stars.filter((s) => s.state === "done").length,
    total: stars.length,
  }), [stars]);

  const nextStar = useMemo(() => stars.find((s) => s.state === "available") ?? null, [stars]);
  const selected = stars.find((s) => s.id === selectedId) ?? null;

  const [newlyAvailableIds, setNewlyAvailableIds] = useState<Set<string>>(new Set());
  const pendingUnlockRef = useRef<{ ids: string[]; nextArea: string | null }>({ ids: [], nextArea: null });

  /* ── pan / zoom ─────────────────────────────────────────────────────── */
  const [tf, setTf] = useState<Transform>({ x: 0, y: 0, scale: 0.5 });
  const [isDragging, setIsDragging] = useState(false);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const currentConstellationRef = useRef<string | null>(null);

  const panToConstellation = useCallback((constellationId: string) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 760;

    const conStars = STARS.filter((s) => s.area === constellationId);
    if (conStars.length === 0) return;
    const xs = conStars.map((s) => s.x);
    const ys = conStars.map((s) => s.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cw = maxX - minX + 300;
    const ch = maxY - minY + 300;

    const availW = isMobile ? vw - 40 : vw - 460;
    const availH = vh - (isMobile ? 180 : 220);
    const scale = Math.min(availW / cw, availH / ch, 1.6);

    const screenCx = isMobile ? vw / 2 : (vw - 412) / 2;
    const screenCy = isMobile ? vh * 0.42 : vh / 2;

    currentConstellationRef.current = constellationId;
    setTf({ x: screenCx - cx * scale, y: screenCy - cy * scale, scale });
  }, []);

  useEffect(() => {
    getProgressAction().then((result) => {
      if (result.ok && result.data.length > 0) {
        const merged = mergeProgress(result.data);
        setStars(merged);
        const firstAvail = merged.find((s) => s.state === "available");
        if (firstAvail) panToConstellation(firstAvail.area);
      } else {
        const initial = STARS.find((s) => s.state === "available");
        if (initial) panToConstellation(initial.area);
      }
      setIsLoading(false);
    });
  }, [panToConstellation]);

  useEffect(() => {
    const onResize = () => {
      if (currentConstellationRef.current) panToConstellation(currentConstellationRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [panToConstellation]);

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
    drag.current.sx = e.clientX;
    drag.current.sy = e.clientY;
    setTf((p) => ({ ...p, x: p.x + dx, y: p.y + dy }));
  };

  const onPointerUp = () => {
    const wasDrag = drag.current;
    drag.current = null;
    setIsDragging(false);
    if (wasDrag && !wasDrag.moved) setSelectedId(null);
  };

  /* ── acciones ────────────────────────────────────────────────────────── */
  const showPendingUnlocks = useCallback(() => {
    const { ids, nextArea } = pendingUnlockRef.current;
    if (ids.length === 0) return;
    setNewlyAvailableIds(new Set(ids));
    setTimeout(() => setNewlyAvailableIds(new Set()), 1200);
    pendingUnlockRef.current = { ids: [], nextArea: null };
    if (nextArea) setTimeout(() => panToConstellation(nextArea), 200);
  }, [panToConstellation]);

  const handleClose = useCallback(() => {
    setSelectedId(null);
    showPendingUnlocks();
  }, [showPendingUnlocks]);

  const openFromGoal = (id: string) => {
    const s = stars.find((x) => x.id === id);
    if (s) panToConstellation(s.area);
    setTimeout(() => setSelectedId(id), 60);
  };

  const lightStar = (id: string) => {
    const s = stars.find((x) => x.id === id);
    if (!s || s.state === "done") return;
    // modal stays open — do NOT close here
    const lit: Star = { ...s, state: "done", mastery: 1, unlockedDate: "hoy" };
    const updatedStars = recompute(stars.map((x) => (x.id === id ? lit : x)), EDGES);
    setStars(updatedStars);
    setXp((v) => v + 100);

    // defer unlock animation until the modal closes
    const prevAvailSet = new Set(stars.filter((x) => x.state === "available").map((x) => x.id));
    const newlyAvail = updatedStars.filter((x) => x.state === "available" && !prevAvailSet.has(x.id));
    if (newlyAvail.length > 0) {
      pendingUnlockRef.current = {
        ids: newlyAvail.map((x) => x.id),
        nextArea: newlyAvail[0]?.area ?? null,
      };
    }

    putProgressAction(id, 1).catch(() => {});
  };

  const addMastery = (id: string) => {
    const current = stars.find((s) => s.id === id);
    if (!current || current.state !== "done" || current.mastery >= 3) return;
    const newMastery = current.mastery + 1;
    setStars((prev) =>
      prev.map((s) =>
        s.id === id && s.state === "done" && s.mastery < 3
          ? { ...s, mastery: newMastery }
          : s,
      ),
    );
    putProgressAction(id, newMastery).catch(() => {});
  };

  // Llamado desde QuizTab cuando la pantalla "etapa 3 completada" se muestra.
  // El timer empieza en ese momento, no al hacer submit.
  const handleStage3Complete = useCallback(() => {
    setTimeout(() => {
      const star = stars.find((s) => s.id === selectedId);
      const area = star ? CONSTELLATIONS[star.area] : null;
      setSelectedId(null);
      showPendingUnlocks();
      if (star && area) {
        setCeleb({ star, area, xpGain: 200 });
      }
    }, 1600);
  }, [stars, selectedId, showPendingUnlocks]);

  return (
    <div className="relative w-full h-[100dvh] bg-secondary overflow-hidden">
      {/* glow radial central — sutil teal para animar el cielo */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse 70% 55% at 42% 52%, rgba(32,190,198,0.055) 0%, transparent 68%)" }}
        aria-hidden="true"
      />

      {/* franjas decorativas — fijas, siempre pegadas al borde derecho */}
      <svg
        className="absolute right-0 top-0 h-full pointer-events-none"
        style={{ width: "clamp(160px, 28vw, 420px)" }}
        viewBox="0 0 420 800"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
      >
        <polygon points="80,-10 200,-10 340,400 200,810 80,810 220,400"  fill="rgba(32,190,198,0.045)" />
        <polygon points="200,-10 320,-10 460,400 320,810 200,810 340,400" fill="rgba(255,255,255,0.055)" />
        <polygon points="310,-10 430,-10 570,400 430,810 310,810 450,400" fill="rgba(255,255,255,0.09)" />
        <polygon points="390,-10 500,-10 640,400 500,810 390,810 520,400" fill="rgba(10,108,185,0.07)" />
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
            willChange: isDragging ? "transform" : "auto",
          }}
        >
          <Sky
            stars={stars}
            tweaks={TWEAKS}
            selectedId={selectedId}
            onSelectStar={setSelectedId}
            newlyAvailableIds={newlyAvailableIds}
          />
        </div>
      </div>

      <HeaderBar
        progress={progress}
        xp={xp}
        streak={META.streakDays}
        userName={userName}
        avatarUrl={avatarUrl}
        role={role}
      />

      <Legend />
      <GoalBar
        nextStar={nextStar}
        area={nextStar ? (CONSTELLATIONS[nextStar.area] ?? null) : null}
        onOpen={openFromGoal}
        progress={progress}
        level={META.level}
      />

      {selected && (
        <DetailPanel
          star={selected}
          area={CONSTELLATIONS[selected.area]!}
          onClose={handleClose}
          onLight={lightStar}
          onMastery={addMastery}
          onStage3Complete={handleStage3Complete}
        />
      )}

      {celeb && (
        <Celebration star={celeb.star} area={celeb.area} xpGain={celeb.xpGain} onDone={() => setCeleb(null)} />
      )}
    </div>
  );
}
