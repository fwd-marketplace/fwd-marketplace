'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Globe,
  ArrowUpRight,
  Clock,
  Monitor,
  Pencil,
  GitBranch,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
} from 'lucide-react';
import { getInitials } from '@/lib/api/safe-json';
import type { PublicJuniorProfile, StudentAvailability, StudentSpecialty } from '@/lib/api/types';

// ── Inline SVG icons ───────────────────────────────────────────────────────────

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const STAR_CHAR = '★';

function StarRow({ score, size = 'sm' }: { score: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'text-xl' : 'text-base';
  return (
    <span className={`inline-flex gap-0.5 ${cls}`} aria-label={`${score} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(score) ? 'text-highlight' : 'text-border'} aria-hidden="true">
          {STAR_CHAR}
        </span>
      ))}
    </span>
  );
}

function toHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//i, '');
}

// ── WorkProject type ───────────────────────────────────────────────────────────

type WorkProject = {
  id: string;
  title: string;
  description: string;
  netlifyUrl: string;
  repoUrl?: string;
  tags: string[];
};

// ── ProjectCard — igual que en PerfilUsuario pero sin onEdit / onDelete ────────

function ProjectCard({
  project,
  onPreview,
}: {
  project: WorkProject;
  onPreview: (project: WorkProject) => void;
}) {
  const t = useTranslations('perfil_junior.work');
  const hostname = (() => {
    try { return new URL(project.netlifyUrl).hostname; } catch { return project.netlifyUrl || '—'; }
  })();
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-soft overflow-hidden flex flex-col transition-all hover:shadow-md">
      {/* Browser chrome header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[oklch(0.97_0.005_245)] border-b border-border">
        <div className="flex gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 rounded bg-white border border-border/50 px-2 py-0.5 text-[11px] text-ink-muted truncate">
          {hostname}
        </div>
      </div>
      {/* Preview area */}
      <div className="h-44 bg-gradient-to-tr from-primary/8 to-secondary/8 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, var(--border) 28px, var(--border) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, var(--border) 28px, var(--border) 29px)' }} />
        <Monitor className="w-12 h-12 text-primary/30" />
      </div>
      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-grow">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg font-extrabold text-ink-strong leading-tight">{project.title}</h3>
          {project.tags[0] && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
              {project.tags[0]}
            </span>
          )}
        </div>
        {project.description && (
          <p className="text-sm text-primary/80 line-clamp-2 leading-relaxed">{project.description}</p>
        )}
        {project.tags.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {project.tags.slice(1).map(tag => (
              <span key={tag} className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-accent/10 text-accent">
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* Actions — solo preview, open, repo (sin edit ni delete) */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => onPreview(project)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 hover:border-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
          >
            <Monitor className="w-3.5 h-3.5" /> {t('preview_btn')}
          </button>
          {project.netlifyUrl && (
            <a
              href={project.netlifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-surface-sunken hover:bg-border/30 text-ink rounded-lg transition-colors"
            >
              {t('open_btn')} <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-surface-sunken hover:bg-border/30 text-ink rounded-lg transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PreviewModal — idéntico al de PerfilUsuario ───────────────────────────────

function PreviewModal({ project, onClose }: { project: WorkProject; onClose: () => void }) {
  const t = useTranslations('perfil_junior.work');
  const [iframeStatus, setIframeStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-strong/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-surface rounded-2xl shadow-elevated flex flex-col overflow-hidden max-h-[90vh]"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink-strong">{t('preview_modal_title')}: {project.title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={project.netlifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
            >
              {t('open_in_new_tab')} <ArrowUpRight className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-sunken rounded-lg transition-colors cursor-pointer"
              aria-label={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="relative flex-grow bg-surface-sunken min-h-[50vh] md:h-[70vh]">
          {iframeStatus === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          {iframeStatus === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertCircle className="w-10 h-10 text-magenta" />
              <p className="text-sm text-ink-muted max-w-md">{t('iframe_error')}</p>
              <a
                href={project.netlifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 px-6 py-2 bg-primary text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                {t('open_in_new_tab')}
              </a>
            </div>
          )}
          <iframe
            src={project.netlifyUrl}
            className={`w-full h-full border-0 transition-opacity duration-300 ${iframeStatus === 'loading' ? 'opacity-0' : 'opacity-100'}`}
            title={`Preview of ${project.title}`}
            onLoad={() => setIframeStatus('loaded')}
            onError={() => setIframeStatus('error')}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type TabId = 'perfil' | 'trabajo';

interface Props {
  perfil: PublicJuniorProfile;
  backHref?: string;
  backLabel?: string;
}

export function PublicJuniorProfile({ perfil, backHref = '/marketplace', backLabel = 'Volver' }: Props) {
  const t = useTranslations('perfil_junior');
  const [activeTab, setActiveTab] = useState<TabId>('perfil');
  const [previewProject, setPreviewProject] = useState<WorkProject | null>(null);

  // ── Mapeo de datos ────────────────────────────────────────────────────────

  const nombre = [perfil.nombre, perfil.apellido1, perfil.apellido2].filter(Boolean).join(' ');

  const badges: string[] = (() => {
    if (!perfil.modalidad_preferida) return [];
    try { return JSON.parse(perfil.modalidad_preferida) as string[]; } catch { return []; }
  })();

  const workProjects: WorkProject[] = perfil.portafolio.map(item => ({
    id: item.id,
    title: item.titulo,
    description: item.descripcion ?? '',
    netlifyUrl: item.url_demo ?? '',
    ...(item.url_repositorio ? { repoUrl: item.url_repositorio } : {}),
    tags: (() => { try { return JSON.parse(item.tecnologias ?? '[]') as string[]; } catch { return []; } })(),
  }));

  // ── Label helpers ─────────────────────────────────────────────────────────

  const SPECIALTY_LABELS: Record<StudentSpecialty, string> = {
    frontend: t('specialty_options.frontend'),
    backend: t('specialty_options.backend'),
    fullstack: t('specialty_options.fullstack'),
    ia: t('specialty_options.ia'),
  };

  const AVAILABILITY_LABELS: Record<StudentAvailability, string> = {
    immediate: t('availability_options.immediate'),
    two_weeks: t('availability_options.two_weeks'),
    one_month: t('availability_options.one_month'),
    unavailable: t('availability_options.unavailable'),
  };

  const MODALITY_LABELS: Record<string, string> = {
    remote: t('modality_options.remote'),
    hybrid: t('modality_options.hybrid'),
    onsite: t('modality_options.onsite'),
  };

  function specialtyLabel(code: string): string {
    return code in SPECIALTY_LABELS ? SPECIALTY_LABELS[code as StudentSpecialty] : code;
  }
  function availabilityLabel(code: string): string {
    return code in AVAILABILITY_LABELS ? AVAILABILITY_LABELS[code as StudentAvailability] : code;
  }
  function badgeLabel(code: string): string {
    return MODALITY_LABELS[code] ?? code;
  }

  const TAB_LABELS: Record<TabId, string> = {
    perfil: t('tabs.perfil'),
    trabajo: t('tabs.trabajo'),
  };

  const hasLinks = perfil.url_github ?? perfil.url_linkedin ?? perfil.url_portfolio;

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-body transition-colors duration-200">

      {/* ── HERO — idéntico al de PerfilUsuario, sin botones de edición ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-white pt-10 pb-16">
        {/* Botón volver dentro del hero */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-10 mb-6">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors duration-[var(--duration-fast)]"
          >
            <ChevronLeft className="size-4" />
            {backLabel}
          </Link>
        </div>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pub-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pub-grid)" />
            <circle cx="90%" cy="10%" r="200" stroke="currentColor" strokeWidth="20" />
            <path d="M-100,200 L400,-100 M-50,300 L500,-150" stroke="currentColor" strokeWidth="8" />
          </svg>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-10 flex flex-col items-center gap-8 md:flex-row md:items-center">

          {/* Avatar — sin botones de upload/delete */}
          <div className="shrink-0">
            <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-white/10 shadow-[var(--shadow-elevated)]">
              {perfil.url_avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={perfil.url_avatar} alt={nombre} className="size-full object-cover" />
              ) : (
                <span className="font-heading text-4xl font-extrabold text-white/90">
                  {getInitials(nombre)}
                </span>
              )}
            </div>
          </div>

          {/* Info — solo modo vista */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1">
              {perfil.especialidad && (
                <span className="inline-flex items-center rounded-full bg-highlight px-3 py-1 font-body text-xs font-bold text-secondary">
                  {specialtyLabel(perfil.especialidad).toUpperCase()}
                </span>
              )}
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                {nombre || t('hero.unnamed')}
                <span className="text-highlight" aria-hidden="true">.</span>
              </h1>
              {perfil.titulo_fwd && (
                <p className="font-body text-base leading-relaxed text-white/80">
                  {perfil.titulo_fwd}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              {badges.map(badge => (
                <span
                  key={badge}
                  className="px-3 py-1 text-xs uppercase tracking-wider rounded-full bg-white/10 text-white border border-white/20"
                >
                  {badgeLabel(badge)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="w-full max-w-7xl mx-auto px-6 md:px-10 py-8 flex-grow space-y-8">

        {/* ── TAB NAV — solo Perfil y Trabajo ─────────────────────────────────── */}
        <nav
          role="tablist"
          aria-label={t('tabs.nav_label')}
          className="flex border-b border-border gap-6 md:gap-8 overflow-x-auto pb-px scrollbar-none"
        >
          {(['perfil', 'trabajo'] as TabId[]).map(tabId => {
            const isActive = activeTab === tabId;
            return (
              <button
                key={tabId}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tabId)}
                className={`border-b-2 py-4 px-1 text-sm md:text-base transition-all flex items-center gap-2 cursor-pointer ${isActive
                  ? 'border-primary text-ink-strong font-semibold'
                  : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                {TAB_LABELS[tabId]}
              </button>
            );
          })}
        </nav>

        {/* ── TAB: PERFIL ──────────────────────────────────────────────────────── */}
        {activeTab === 'perfil' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">

              {/* Personal info */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-ink-strong">{t('personal.title')}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3 bg-surface-sunken p-3.5 rounded-xl border border-border">
                    <Clock className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <span className="block text-xs text-ink-muted">{t('personal.location_display')}</span>
                      <span className="font-semibold text-ink-strong">
                        {perfil.disponibilidad ? availabilityLabel(perfil.disponibilidad) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    {t('personal.bio_heading')}
                  </h3>
                  <p className="text-ink leading-relaxed text-sm md:text-base font-normal">
                    {perfil.descripcion || t('personal.bio_empty')}
                  </p>
                </div>
              </section>

              {/* Stack */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-ink-strong">{t('stack.title')}</h2>
                <div className="flex flex-wrap gap-2.5">
                  {perfil.skills.length > 0 ? (
                    perfil.skills.map(skill => (
                      <div
                        key={skill}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-primary/20 bg-primary/10 text-primary transition-all"
                      >
                        <span>{skill}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-ink-muted italic">{t('stack.empty')}</p>
                  )}
                </div>
              </section>

              {/* Conocimientos adicionales */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-ink-strong">{t('knowledge.title')}</h2>
                  <p className="text-sm text-ink-muted mt-1">{t('knowledge.description')}</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {perfil.conocimientos.length > 0 ? (
                    perfil.conocimientos.map(c => (
                      <div
                        key={c}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-accent/10 border border-accent/30 text-ink hover:border-accent/60 transition-all"
                      >
                        <span>{c}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-ink-muted italic">{t('knowledge.empty')}</p>
                  )}
                </div>
              </section>

              {/* Links */}
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-ink-strong">{t('links.title')}</h2>
                {hasLinks ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {perfil.url_github && (
                      <a
                        href={toHref(perfil.url_github)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-surface-sunken border border-border hover:border-primary/50 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <GithubIcon className="w-5 h-5 text-primary shrink-0" />
                          <div>
                            <span className="block text-xs text-ink-muted">{t('links.github')}</span>
                            <span className="text-sm font-bold text-ink-strong break-all">
                              {stripProtocol(perfil.url_github).replace('github.com/', '')}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-ink-subtle group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    )}
                    {perfil.url_linkedin && (
                      <a
                        href={toHref(perfil.url_linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-surface-sunken border border-border hover:border-primary/50 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <LinkedinIcon className="w-5 h-5 text-primary shrink-0" />
                          <div>
                            <span className="block text-xs text-ink-muted">{t('links.linkedin')}</span>
                            <span className="text-sm font-bold text-ink-strong break-all">
                              {stripProtocol(perfil.url_linkedin).replace('linkedin.com/in/', '')}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-ink-subtle group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    )}
                    {perfil.url_portfolio && (
                      <a
                        href={toHref(perfil.url_portfolio)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-surface-sunken border border-border hover:border-primary/50 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-primary shrink-0" />
                          <div>
                            <span className="block text-xs text-ink-muted">{t('links.portfolio')}</span>
                            <span className="text-sm font-bold text-ink-strong break-all">
                              {stripProtocol(perfil.url_portfolio)}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-ink-subtle group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted italic">{t('links.empty')}</p>
                )}
              </section>
            </div>

            {/* Sidebar — reputación si existe */}
            <div className="space-y-8">
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-bold text-ink-strong">{t('hero.reputation_label')}</h2>
                </div>
                {typeof (perfil as Record<string, unknown>)['reputacion'] === 'number' &&
                  ((perfil as Record<string, unknown>)['reputacion'] as number) > 0 ? (
                  <div className="flex items-center gap-2">
                    <StarRow score={(perfil as Record<string, unknown>)['reputacion'] as number} size="md" />
                    <span className="font-heading text-lg font-extrabold text-highlight tracking-tight">
                      {((perfil as Record<string, unknown>)['reputacion'] as number).toFixed(1)}
                    </span>
                    <span className="font-body text-xs text-white/70">{t('hero.reputation_label')}</span>
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted italic">{t('calificaciones.empty')}</p>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ── TAB: TRABAJO ─────────────────────────────────────────────────────── */}
        {activeTab === 'trabajo' && (
          <section className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-ink-strong">
                {t('work.title')}<span className="text-primary">.</span>
              </h1>
              <p className="text-sm text-ink-muted leading-relaxed">{t('work.description')}</p>
            </div>

            <div className="pt-2">
              {workProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {workProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onPreview={setPreviewProject}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                  <Monitor className="w-10 h-10 text-ink-muted/40 mx-auto mb-3" />
                  <p className="text-sm text-ink-muted italic">{t('work.no_projects')}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {previewProject && (
          <PreviewModal
            project={previewProject}
            onClose={() => setPreviewProject(null)}
          />
        )}
      </main>
    </div>
  );
}
