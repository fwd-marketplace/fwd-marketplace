'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Check, Lock, BookOpen, Compass, Mountain, Sparkles, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { HeroJourneyData } from '@/lib/hero-journey/mock';

type MilestoneId = keyof HeroJourneyData;

interface MilestoneRow {
  id: MilestoneId;
  icon: LucideIcon;
  color: string;       // Tailwind bg class
  glow: string;        // box-shadow color inline
}

const ROWS: MilestoneRow[] = [
  { id: 'llamado',        icon: Compass,  color: 'bg-primary',   glow: 'rgba(10,108,185,0.5)'  },
  { id: 'preparacion',    icon: BookOpen, color: 'bg-secondary',  glow: 'rgba(102,45,145,0.5)' },
  { id: 'desafio',        icon: Mountain, color: 'bg-highlight',  glow: 'rgba(255,203,5,0.5)'  },
  { id: 'transformacion', icon: Sparkles, color: 'bg-accent',     glow: 'rgba(32,190,198,0.5)' },
  { id: 'reconocimiento', icon: Trophy,   color: 'bg-magenta',    glow: 'rgba(236,0,140,0.5)'  },
];

interface ViajeActivityProps {
  heroJourney: HeroJourneyData;
}

export function ViajeActivity({ heroJourney }: ViajeActivityProps) {
  const t = useTranslations('bienvenida.estrella');
  const locale = useLocale();

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-ink-strong mb-4">{t('activity_title')}</h2>

      <div className="bg-surface rounded-xl shadow-soft border border-border flex-1 overflow-hidden">
        <ul className="divide-y divide-border">
          {ROWS.map((row) => {
            const data = heroJourney[row.id];
            const isDone = data.status === 'done';
            const Icon = row.icon;

            return (
              <li key={row.id} className="flex items-start gap-4 px-5 py-4">
                {/* Icon circle */}
                <div
                  className={`relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-all duration-[var(--duration-base)] ${isDone ? row.color : 'bg-surface-sunken'}`}
                  style={isDone ? { boxShadow: `0 0 14px ${row.glow}` } : undefined}
                >
                  {isDone
                    ? <Icon className="h-5 w-5" />
                    : <Lock className="h-4 w-4 text-ink-subtle" />
                  }
                  {isDone && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-semibold text-sm leading-tight ${isDone ? 'text-ink-strong' : 'text-ink-muted'}`}>
                      {t(`items.${row.id}.name`)}
                    </span>
                    {isDone && (
                      <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        {t('status.done')}
                      </span>
                    )}
                  </div>

                  {isDone && data.date ? (
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      {t('unlocked_on', { date: data.date })}
                    </p>
                  ) : row.id === 'transformacion' && data.learningPct !== null ? (
                    /* La Transformación: show learning progress */
                    <div className="mt-1.5 space-y-1">
                      <p className="text-xs text-ink-muted">
                        {t('learning_pct', { pct: data.learningPct })}
                      </p>
                      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-[var(--duration-slow)]"
                          style={{ width: `${data.learningPct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      <span className="text-ink-muted">{t('to_unlock')}</span>{' '}
                      {t(`items.${row.id}.task`)}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <Link
        href={`/${locale}/mapa-de-aprendizaje`}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition-colors duration-[var(--duration-fast)] hover:bg-accent/20"
      >
        {t('activity_map_btn')}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
