'use client';

import { useCallback, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Mountain,
  Sparkles,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { HeroJourneyData } from '@/lib/hero-journey/mock';

type MilestoneId =
  | 'llamado'
  | 'preparacion'
  | 'desafio'
  | 'transformacion'
  | 'reconocimiento';

type MilestoneStatus = 'done' | 'progress' | 'pending';

interface MilestoneConfig {
  id: MilestoneId;
  icon: LucideIcon;
  colorVar: string;
  status: MilestoneStatus;
  progress: number;
  tipAngle: number;
}

interface StarPoint {
  x: number;
  y: number;
}

// Geometria del contorno de la estrella de 5 puntas. Coordenadas en el
// sistema del viewBox 0-100 del SVG; las puntas siguen el orden del viaje.
const STAR_CENTER: StarPoint = { x: 50, y: 48 };
const STAR_OUTER_RADIUS = 37;
const STAR_INNER_RADIUS = 15;
const VALLEY_OFFSET_DEG = 36;
const FULL_PROGRESS = 100;

const MILESTONE_META: readonly Omit<MilestoneConfig, 'status' | 'progress'>[] = [
  { id: 'llamado',        icon: Compass,  colorVar: 'var(--primary)',   tipAngle: -90  },
  { id: 'preparacion',    icon: BookOpen, colorVar: 'var(--secondary)', tipAngle: -18  },
  { id: 'desafio',        icon: Mountain, colorVar: 'var(--highlight)', tipAngle:  54  },
  { id: 'transformacion', icon: Sparkles, colorVar: 'var(--accent)',    tipAngle: 126  },
  { id: 'reconocimiento', icon: Trophy,   colorVar: 'var(--magenta)',   tipAngle: 198  },
];

function buildMilestones(heroJourney: HeroJourneyData): readonly MilestoneConfig[] {
  return MILESTONE_META.map((meta) => {
    const data = heroJourney[meta.id];
    const progress = meta.id === 'transformacion'
      ? (data.learningPct ?? 0)
      : data.status === 'done' ? 100 : 0;
    return { ...meta, status: data.status, progress };
  });
}

// Estrellas tenues decorativas (titilan, no interactuan). Posiciones fijas
// para no provocar diferencias entre servidor y cliente.
const FAINT_STARS: readonly StarPoint[] = [
  { x: 8, y: 16 }, { x: 95, y: 62 }, { x: 12, y: 72 }, { x: 62, y: 14 },
  { x: 40, y: 18 }, { x: 90, y: 80 }, { x: 33, y: 58 }, { x: 67, y: 58 },
  { x: 50, y: 96 }, { x: 18, y: 92 }, { x: 84, y: 16 }, { x: 6, y: 44 }, { x: 94, y: 40 },
];

function toPolarPoint(angleDeg: number, radius: number): StarPoint {
  const radians = (angleDeg * Math.PI) / 180;
  return {
    x: Number((STAR_CENTER.x + radius * Math.cos(radians)).toFixed(2)),
    y: Number((STAR_CENTER.y + radius * Math.sin(radians)).toFixed(2)),
  };
}

function getTipPoint(milestone: MilestoneConfig): StarPoint {
  return toPolarPoint(milestone.tipAngle, STAR_OUTER_RADIUS);
}

// Diez segmentos del contorno: solo dependen de los angulos (estaticos).
const STAR_EDGES: readonly { from: StarPoint; to: StarPoint }[] = MILESTONE_META.flatMap(
  (meta) => {
    const tip = toPolarPoint(meta.tipAngle, STAR_OUTER_RADIUS);
    return [
      { from: tip, to: toPolarPoint(meta.tipAngle - VALLEY_OFFSET_DEG, STAR_INNER_RADIUS) },
      { from: tip, to: toPolarPoint(meta.tipAngle + VALLEY_OFFSET_DEG, STAR_INNER_RADIUS) },
    ];
  }
);

const STATUS_PILL_CLASS: Record<MilestoneStatus, string> = {
  done: 'bg-accent/20 text-accent',
  progress: 'bg-warning/20 text-warning',
  pending: 'bg-white/10 text-white/70',
};

interface EstrellaProcesoProps {
  heroJourney: HeroJourneyData;
}

export function EstrellaProceso({ heroJourney }: EstrellaProcesoProps) {
  const t = useTranslations('bienvenida.estrella');
  const locale = useLocale();

  const [activeId, setActiveId] = useState<MilestoneId | null>(null);
  const [isPinned, setIsPinned] = useState(false);

  const MILESTONES = buildMilestones(heroJourney);
  const doneCount = MILESTONES.filter((milestone) => milestone.status === 'done').length;
  const total = MILESTONES.length;
  const litPercent = Math.round((doneCount / total) * FULL_PROGRESS);
  const activeMilestone = MILESTONES.find((milestone) => milestone.id === activeId) ?? null;

  // Hover/focus: muestra el modal solo mientras el puntero (o el foco) esta
  // sobre el nodo. El clic lo fija (pinned) hasta cerrarlo explicitamente.
  const openTask = useCallback((id: MilestoneId) => {
    setActiveId(id);
  }, []);

  const closeOnLeave = useCallback(() => {
    if (!isPinned) setActiveId(null);
  }, [isPinned]);

  const pinTask = useCallback((id: MilestoneId) => {
    setActiveId(id);
    setIsPinned(true);
  }, []);

  const closeTask = useCallback(() => {
    setIsPinned(false);
    setActiveId(null);
  }, []);

  return (
    <div className="estrella-panel relative overflow-hidden rounded-2xl border border-white/10 bg-constellation-sky p-6 text-white shadow-soft flex-1 flex flex-col">
      {/* Estrellas tenues de ambiente */}
      <div className="estrella-starfield" aria-hidden="true">
        {FAINT_STARS.map((star) => (
          <span
            key={`${star.x}-${star.y}`}
            style={{ left: `${star.x}%`, top: `${star.y}%` }}
          />
        ))}
      </div>

      {/* Encabezado: eyebrow + progreso de estrellas encendidas */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-highlight">
          <Sparkles className="h-4 w-4" />
          {t('eyebrow')}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white/80">
            <span className="font-heading text-lg font-bold text-white">{doneCount}</span>
            {` / ${total} `}
            {t('lit_label')}
          </span>
          <span className="estrella-progress-track" aria-hidden="true">
            <i style={{ width: `${litPercent}%` }} />
          </span>
        </div>
      </div>

      {/* Escenario de la estrella */}
      <div className="estrella-stage relative mx-auto mt-2 aspect-square w-full max-w-md">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t('aria_stage')}
          className="estrella-svg"
        >
          {FAINT_STARS.map((star) => (
            <circle
              key={`faint-${star.x}-${star.y}`}
              className="estrella-faint"
              cx={star.x}
              cy={star.y}
              r="0.5"
            />
          ))}

          {STAR_EDGES.map((edge) => (
            <line
              key={`edge-${edge.from.x}-${edge.from.y}-${edge.to.x}-${edge.to.y}`}
              className="estrella-edge"
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
            />
          ))}
        </svg>

        {/* Centro: sin texto */}
        <div className="estrella-center" aria-hidden="true" />

        {/* Nodos interactivos en cada punta */}
        {MILESTONES.map((milestone) => {
          const tip = getTipPoint(milestone);
          const Icon = milestone.icon;
          const isFocused = activeId === milestone.id;
          return (
            <button
              key={milestone.id}
              type="button"
              className={`estrella-node estrella-node-${milestone.status}${isFocused ? ' is-focus' : ''}`}
              style={{ left: `${tip.x}%`, top: `${tip.y}%`, ['--node-color' as string]: milestone.colorVar }}
              aria-label={t(`items.${milestone.id}.name`)}
              onMouseEnter={() => openTask(milestone.id)}
              onMouseLeave={closeOnLeave}
              onFocus={() => openTask(milestone.id)}
              onBlur={closeOnLeave}
              onClick={() => pinTask(milestone.id)}
            >
              <span className="estrella-node-circle">
                <span className="estrella-node-pulse" aria-hidden="true" />
                <Icon className="h-5 w-5" />
                {milestone.status === 'done' && (
                  <span className="estrella-node-check">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className="estrella-node-pill">{t(`items.${milestone.id}.name`)}</span>
            </button>
          );
        })}
      </div>

      {/* Modal de tarea del hito activo */}
      {activeMilestone && (
        <div className={`estrella-task-layer${isPinned ? ' is-pinned' : ''}`}>
          {isPinned && (
            <div className="estrella-task-scrim" onClick={closeTask} aria-hidden="true" />
          )}
          <div
            className="estrella-task-modal"
            role="dialog"
            aria-label={t(`items.${activeMilestone.id}.name`)}
            style={{ ['--node-color' as string]: activeMilestone.colorVar }}
          >
            <button type="button" className="estrella-task-close" onClick={closeTask} aria-label={t('close')}>
              <span aria-hidden="true">&times;</span>
            </button>

            <div className="flex items-start gap-3">
              <span className="estrella-task-glyph">
                <activeMilestone.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-heading text-lg font-bold leading-tight text-ink-strong">
                  {t(`items.${activeMilestone.id}.name`)}
                </h3>
                <span
                  className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_PILL_CLASS[activeMilestone.status]}`}
                >
                  {t(`status.${activeMilestone.status}`)}
                  {activeMilestone.status === 'done' && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
              </div>
            </div>

            <p className="mt-3 text-sm text-ink-muted">{t(`items.${activeMilestone.id}.desc`)}</p>

            <div className="estrella-task-box">
              <span className="estrella-task-eyebrow">
                <Target className="h-3.5 w-3.5" />
                {activeMilestone.status === 'done' ? t('task_done_label') : t('task_todo_label')}
              </span>
              <p className="mt-1 text-sm font-medium text-ink-strong">
                {t(`items.${activeMilestone.id}.task`)}
              </p>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
                <span>{t('progress_label')}</span>
                <span className="font-bold text-ink-strong">{activeMilestone.progress}%</span>
              </div>
              <span className="estrella-task-bar" aria-hidden="true">
                <i style={{ width: `${activeMilestone.progress}%` }} />
              </span>
            </div>

            {activeMilestone.status === 'done' ? (
              <p className="mt-3 text-xs text-ink-subtle">
                {t('lit_on', { date: heroJourney[activeMilestone.id].date })}
              </p>
            ) : (
              <Link
                href={`/${locale}${t(`next_links.${activeMilestone.id}`)}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
              >
                {t('next_hint')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
