'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowRight,
  Folder,
  Building2,
  Send,
  Compass,
  BookOpen,
  Mountain,
  Sparkles,
  Trophy
} from 'lucide-react';
import { FwdGeoBackdrop } from '@/components/ui/fwd-geo-backdrop';
import { EstrellaProceso } from '@/components/comp-bienvenida/EstrellaProceso';
import { ViajeActivity } from '@/components/comp-bienvenida/ViajeActivity';
import { LlamadoToast } from '@/components/comp-bienvenida/LlamadoToast';
import type { HeroJourneyData } from '@/lib/hero-journey/mock';
import type { ApiNotificacion, MiInvitacion, RecommendedProject } from '@/lib/api/types';
import { formatCompensacion } from '@/lib/marketplace/compensation';

/** Datos reales del inicio del junior (los provee la página vía props; cero mock). */
export interface BienvenidaData {
  stats: {
    proyectosDisponibles: number;
    empresasActivas: number;
    matchTop: number;
    misPostulaciones: number;
  };
  recomendados: RecommendedProject[];
  actividad: ApiNotificacion[];
  invitaciones: MiInvitacion[];
}

/** Iniciales (máx 2) para el avatar de una empresa. */
function empresaIniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Colores de acento que rotan para los avatares de empresas (tokens FWD). */
const CARD_ACCENTS = ['bg-secondary', 'bg-accent', 'bg-primary', 'bg-warning'] as const;

type GreetingKey = 'greeting_morning' | 'greeting_afternoon' | 'greeting_evening';

/** Saludo según la hora LOCAL del usuario (mañana / tarde / noche). */
function greetingForHour(hour: number): GreetingKey {
  if (hour >= 5 && hour < 12) return 'greeting_morning';
  if (hour >= 12 && hour < 19) return 'greeting_afternoon';
  return 'greeting_evening';
}

interface BienvenidaDashboardProps {
  isJunior: boolean;
  heroJourney: HeroJourneyData;
  data: BienvenidaData;
}

export function BienvenidaDashboard({ isJunior, heroJourney, data }: BienvenidaDashboardProps) {
  const t = useTranslations('bienvenida');
  const locale = useLocale();
  const { stats, recomendados, actividad, invitaciones } = data;

  // Se calcula tras montar (useEffect) para usar la hora del navegador del
  // usuario y evitar el mismatch de hidratación: el servidor no conoce su zona.
  const [greetingKey, setGreetingKey] = useState<GreetingKey>('greeting_morning');

  useEffect(() => {
    setGreetingKey(greetingForHour(new Date().getHours()));
  }, []);

  return (
    <>
    <div className="min-h-screen bg-canvas font-body pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary px-6 py-16 md:px-10 lg:px-16 text-white lg:py-24">
        <FwdGeoBackdrop />
        <div className="relative z-10 mx-auto max-w-7xl flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">

          {/* Left Column */}
          <div className="flex-1 space-y-8">
            <div>
              <p className="text-highlight font-bold text-sm tracking-wider uppercase mb-4">
                {t('hero.welcome')}
              </p>
              <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight mb-6">
                {t(`hero.${greetingKey}`)}<span className="text-primary">.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 whitespace-pre-line max-w-xl">
                {t('hero.description')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${locale}/marketplace`}
                className="inline-flex h-12 items-center justify-center rounded-full bg-highlight px-8 font-semibold text-secondary transition-opacity hover:opacity-90"
              >
                {t('hero.btn_explore')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href={`/${locale}/perfil-estudiante`}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-8 font-semibold text-white transition-colors hover:bg-white/10"
              >
                {t('hero.btn_edit')}
              </Link>
            </div>
          </div>

          {/* Right Column — Constellation animation */}
          <div className="hidden lg:flex flex-1 relative h-[400px] w-full items-center justify-center">

            <style>{`
              @keyframes centerReveal {
                0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
                65%  { transform: scale(1.1) rotate(5deg);  opacity: 1; }
                100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
              }
              @keyframes orbitExpand {
                0%   { transform: scale(0); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes cNodeFade {
                from { opacity: 0; }
                to   { opacity: 1; }
              }
              @keyframes cIconPop {
                0%   { transform: scale(0.1); }
                55%  { transform: scale(1.3);  filter: brightness(2.8) drop-shadow(0 0 12px currentColor); }
                78%  { transform: scale(0.93); filter: brightness(1.4); }
                100% { transform: scale(1);    filter: brightness(1); }
              }
              @keyframes cLinePulse {
                0%, 100% { opacity: 0.35; filter: drop-shadow(0 0 2px rgba(255,255,255,0.4)); }
                50%      { opacity: 1;    filter: drop-shadow(0 0 8px rgba(255,255,255,0.9)); }
              }
              @keyframes cStarTwinkle {
                0%, 100% { opacity: var(--s-op, 0.15); transform: scale(1); }
                50%      { opacity: 0.9; transform: scale(2.4); }
              }
              .c-center { animation: centerReveal 0.9s cubic-bezier(0.34,1.56,0.64,1) both; }
              .c-orbit  { animation: orbitExpand  0.65s ease-out both; }
              .c-node   { animation: cNodeFade 0.45s ease-out both; }
              .c-icon   { animation: cIconPop  0.65s cubic-bezier(0.34,1.56,0.64,1) both; }
              .c-line   {
                stroke-dasharray: 1 6;
                stroke-linecap: round;
                animation: cNodeFade 0.5s ease-out both, cLinePulse 3s ease-in-out infinite;
              }
.c-point  { animation: cNodeFade 0.35s ease-out both, cLinePulse 3s ease-in-out infinite; }
              .c-star   { animation: cStarTwinkle var(--s-dur,2.5s) ease-in-out infinite both; }
            `}</style>

            {/* Background stars — deterministic (no hydration mismatch) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {[...Array(22)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white c-star"
                  style={{
                    width:  `${1 + (i * 7  % 3)}px`,
                    height: `${1 + (i * 7  % 3)}px`,
                    top:    `${(i * 17 + 11) % 97}%`,
                    left:   `${(i * 13 +  7) % 97}%`,
                    '--s-op':  0.1 + (i % 5) * 0.08,
                    '--s-dur': `${2 + (i % 3) * 0.8}s`,
                    animationDelay: `${3.9 + (i % 7) * 0.22}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Center node */}
            <div className="c-center absolute z-30 flex h-36 w-36 items-center justify-center rounded-full border border-primary/40 bg-secondary/80 backdrop-blur-md shadow-[0_0_60px_rgba(102,45,145,0.7)]">
              <div className="absolute inset-0 rounded-full border border-white/20 scale-[0.85]" />
              <div className="absolute inset-0 rounded-full border border-magenta/30 scale-[1.15]" />
              <span className="text-center text-base font-bold leading-tight px-2 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">Viaje del{' '}Héroe</span>
            </div>

            {/* Orbit rings */}
            <div className="c-orbit absolute h-[250px] w-[250px] rounded-full border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] z-10" style={{ animationDelay: '0.5s' }} />
            <div className="c-orbit absolute h-[350px] w-[350px] rounded-full border border-white/5  shadow-[0_0_30px_rgba(255,255,255,0.02)] z-10" style={{ animationDelay: '0.75s' }} />

            {/* 1 · El Llamado */}
            <div className="c-node absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30 cursor-pointer" style={{ animationDelay: '1.3s' }}>
              <div className="c-icon flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_20px_rgba(10,108,185,0.6)] border border-white/20 transition-transform duration-300 hover:scale-110" style={{ animationDelay: '1.3s' }}>
                <Compass className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm bg-secondary/60 border border-white/10 px-3 py-1.5 rounded backdrop-blur-md shadow-lg">El Llamado</span>
            </div>

            {/* 2 · La Preparación */}
            <div className="c-node absolute top-1/4 right-0 flex flex-col items-center gap-2 z-30 cursor-pointer" style={{ animationDelay: '1.8s' }}>
              <div className="c-icon flex h-12 w-12 items-center justify-center rounded-full bg-secondary border border-white/30 text-white shadow-[0_0_20px_rgba(102,45,145,0.6)] transition-transform duration-300 hover:scale-110" style={{ animationDelay: '1.8s' }}>
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm bg-secondary/60 border border-white/10 px-3 py-1.5 rounded backdrop-blur-md shadow-lg">La Preparación</span>
            </div>

            {/* 3 · El Desafío */}
            <div className="c-node absolute bottom-4 right-1/4 flex flex-col items-center gap-2 z-30 cursor-pointer" style={{ animationDelay: '2.3s' }}>
              <div className="c-icon flex h-12 w-12 items-center justify-center rounded-full bg-highlight text-white shadow-[0_0_20px_rgba(255,203,5,0.6)] border border-white/20 transition-transform duration-300 hover:scale-110" style={{ animationDelay: '2.3s' }}>
                <Mountain className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm bg-secondary/60 border border-white/10 px-3 py-1.5 rounded backdrop-blur-md shadow-lg">El Desafío</span>
            </div>

            {/* 4 · La Transformación */}
            <div className="c-node absolute bottom-10 left-1/4 flex flex-col items-center gap-2 z-30 cursor-pointer" style={{ animationDelay: '2.8s' }}>
              <div className="c-icon flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-[0_0_20px_rgba(32,190,198,0.6)] border border-white/20 transition-transform duration-300 hover:scale-110" style={{ animationDelay: '2.8s' }}>
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm bg-secondary/60 border border-white/10 px-3 py-1.5 rounded backdrop-blur-md shadow-lg">La Transformación</span>
            </div>

            {/* 5 · El Reconocimiento */}
            <div className="c-node absolute top-1/3 left-4 flex flex-col items-center gap-2 z-30 cursor-pointer" style={{ animationDelay: '3.3s' }}>
              <div className="c-icon flex h-12 w-12 items-center justify-center rounded-full bg-magenta text-white shadow-[0_0_20px_rgba(236,0,140,0.6)] border border-white/20 transition-transform duration-300 hover:scale-110" style={{ animationDelay: '3.3s' }}>
                <Trophy className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm bg-secondary/60 border border-white/10 px-3 py-1.5 rounded backdrop-blur-md shadow-lg">El Reconocimiento</span>
            </div>

            {/* SVG connections */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none" style={{ zIndex: 20 }}>
              {/* Primary lines — fade in with their node, then pulse */}
              <line x1="50%" y1="10%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" className="c-line" style={{ animationDelay: '1.3s, 5.5s' }} />
              <line x1="85%" y1="35%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" className="c-line" style={{ animationDelay: '1.8s, 5.5s' }} />
              <line x1="75%" y1="85%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" className="c-line" style={{ animationDelay: '2.3s, 5.5s' }} />
              <line x1="25%" y1="80%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" className="c-line" style={{ animationDelay: '2.8s, 5.5s' }} />
              <line x1="15%" y1="35%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" className="c-line" style={{ animationDelay: '3.3s, 5.5s' }} />

              {/* Midpoint glow dots — appear last, then pulse */}
              <circle cx="50%" cy="30%" r="2"   fill="white" className="c-point" style={{ animationDelay: '4.1s, 5.5s' }} />
              <circle cx="67%" cy="42%" r="1.5" fill="white" className="c-point" style={{ animationDelay: '4.3s, 5.5s' }} />
              <circle cx="62%" cy="67%" r="2"   fill="white" className="c-point" style={{ animationDelay: '4.5s, 5.5s' }} />
              <circle cx="37%" cy="65%" r="1.5" fill="white" className="c-point" style={{ animationDelay: '4.7s, 5.5s' }} />
              <circle cx="32%" cy="42%" r="2"   fill="white" className="c-point" style={{ animationDelay: '4.9s, 5.5s' }} />
            </svg>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 -mt-8 relative z-20 space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface rounded-xl p-6 shadow-soft flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Folder className="h-6 w-6" />
            </div>
            <div>
              <div className="font-heading text-3xl font-bold">{stats.proyectosDisponibles}</div>
              <div className="text-sm font-medium text-ink-strong">{t('stats.projects')}</div>
              <Link href={`/${locale}/marketplace`} className="text-xs text-primary font-medium hover:underline flex items-center mt-1">
                {t('stats.view_all')} <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
          <div className="bg-surface rounded-xl p-6 shadow-soft flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-accent text-accent">
              <span className="font-bold text-lg">{stats.matchTop}%</span>
            </div>
            <div>
              <div className="text-sm font-bold text-ink-strong mb-1">{t('stats.match')}</div>
              <div className="text-xs text-ink-muted">{t('stats.match_desc')}</div>
            </div>
          </div>
          <div className="bg-surface rounded-xl p-6 shadow-soft flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-magenta/10 text-magenta">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="font-heading text-3xl font-bold">{stats.empresasActivas}</div>
              <div className="text-sm font-medium text-ink-strong">{t('stats.active_companies')}</div>
              <Link href={`/${locale}/empresas`} className="text-xs text-primary font-medium hover:underline flex items-center mt-1">
                {t('stats.view_companies')} <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
          <div className="bg-surface rounded-xl p-6 shadow-soft flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <div className="font-heading text-3xl font-bold">{stats.misPostulaciones}</div>
              <div className="text-sm font-medium text-ink-strong">{t('stats.applications')}</div>
              <Link href={`/${locale}/gestion`} className="text-xs text-primary font-medium hover:underline flex items-center mt-1">
                {t('stats.view_applications')} <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recommended Projects — ranking real por afinidad (matching contra el perfil) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ink-strong">{t('recommended.title')}</h2>
            <Link href={`/${locale}/marketplace`} className="text-sm font-medium text-primary hover:underline flex items-center">
              {t('recommended.view_all')} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          {recomendados.length === 0 ? (
            <div className="bg-surface rounded-xl p-8 shadow-soft border border-border text-center">
              <p className="text-sm text-ink-muted">{t('recommended.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recomendados.map((project) => {
                const badgeKey = project.score >= 85 ? 'high_match' : 'new';
                const skills = project.skills.flatMap((s) => (s.skill ? [s.skill.nombre] : [])).slice(0, 3);
                return (
                  <Link
                    key={project.id}
                    href={`/${locale}/marketplace/${project.id}`}
                    className="bg-surface rounded-xl p-6 shadow-soft border border-border transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-primary/40"
                  >
                    <div className="mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-canvas ${badgeKey === 'high_match' ? 'text-accent' : 'text-primary'}`}>
                        {t(`recommended.badges.${badgeKey}`)}
                      </span>
                    </div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${badgeKey === 'high_match' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                        <Folder className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold text-ink-strong truncate">{project.titulo}</h3>
                        <div className="text-sm text-ink-muted flex items-center gap-1 truncate">
                          <Building2 className="h-3 w-3 shrink-0" /> {project.empresa?.nombre_comercial ?? '—'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {skills.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-canvas border border-border rounded-md text-xs text-ink">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-3 text-xs text-ink-muted">
                        <span>{project.plazo_dias} {t('recommended.days')}</span>
                        {project.compensacion != null && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-ink-subtle"></span>
                            <span className="font-semibold text-accent">
                              {formatCompensacion(project.compensacion, project.moneda)}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-accent text-accent font-bold text-sm">
                          {project.score}%
                        </div>
                        <span className="text-[10px] text-accent mt-1 font-medium">{t('recommended.match')}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Viaje del Héroe — solo visible para juniors (role = student) */}
        {isJunior && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2 flex flex-col">
              <div className="mb-5">
                <h2 className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong">
                  {t('progress.title')}<span className="text-primary">.</span>
                </h2>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-muted">
                  {t('progress.subtitle')}
                </p>
              </div>
              <EstrellaProceso heroJourney={heroJourney} />
            </div>
            <ViajeActivity heroJourney={heroJourney} />
          </div>
        )}

        {/* Empresas interesadas — invitaciones reales que recibió el junior */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-ink-strong">{t('companies.title')}</h2>
          </div>
          {invitaciones.length === 0 ? (
            <div className="bg-surface rounded-xl p-8 shadow-soft border border-border text-center">
              <p className="text-sm text-ink-muted">{t('companies.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {invitaciones.map((inv, i) => {
                const nombre = inv.proyecto?.empresa?.nombre_comercial ?? t('companies.una_empresa');
                const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
                const card = (
                  <div className="bg-surface rounded-xl p-5 shadow-soft border border-border flex items-center gap-4 h-full">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${accent} font-heading text-sm font-bold text-white`}>
                      {empresaIniciales(nombre)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-ink-strong truncate">{nombre}</div>
                      <div className="text-xs text-ink-muted truncate">
                        {t('companies.invited_to')} {inv.proyecto?.titulo ?? ''}
                      </div>
                    </div>
                  </div>
                );
                return inv.proyecto ? (
                  <Link
                    key={inv.id}
                    href={`/${locale}/marketplace/${inv.proyecto.id}`}
                    className="transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:opacity-90"
                  >
                    {card}
                  </Link>
                ) : (
                  <div key={inv.id}>{card}</div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Activity — notificaciones reales del junior */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-ink-strong">{t('activity.title')}</h2>
          </div>
          {actividad.length === 0 ? (
            <div className="bg-surface rounded-xl p-8 shadow-soft border border-border text-center">
              <p className="text-sm text-ink-muted">{t('activity.empty')}</p>
            </div>
          ) : (
            <div className="bg-surface rounded-xl shadow-soft border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {actividad.slice(0, 5).map((n) => (
                  <div key={n.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 text-sm text-ink-strong">{n.mensaje}</div>
                    </div>
                    <span className="shrink-0 text-xs text-ink-muted">
                      {new Date(n.fecha).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>

    {isJunior && <LlamadoToast />}
    </>
  );
}