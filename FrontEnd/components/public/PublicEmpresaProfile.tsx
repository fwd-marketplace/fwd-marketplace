'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Globe,
  Building2,
  Target,
  Clock,
  ShieldCheck,
  MapPin,
  Users,
  ChevronLeft,
  X,
  Brain,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FwdGeoBackdrop } from '@/components/ui/fwd-geo-backdrop';
import { cn } from '@/lib/utils';
import type { ApiProject, PublicEmpresaProfile } from '@/lib/api/types';

// ── Types (mirror de mi-empresa.tsx) ─────────────────────────────────────────

type ProjectType =
  | 'web' | 'mobile' | 'ai' | 'automation' | 'dashboards'
  | 'integrations' | 'ux' | 'data' | 'other';

type StartupStage = 'idea' | 'mvp' | 'validating' | 'scaling';

type TechSupport =
  | 'web' | 'mobile' | 'backend' | 'ai' | 'ux' | 'data' | 'automation' | 'other';

type BudgetRange = 'under_500' | 'range_500_1000' | 'range_1000_2500' | 'flexible';

const ALL_PROJECT_TYPES: ProjectType[] = [
  'web', 'mobile', 'ai', 'automation', 'dashboards',
  'integrations', 'ux', 'data', 'other',
];

type Contact = {
  name: string;
  role: string;
  email: string;
  initial: string;
};

type TabId = 'empresa' | 'proyectos';

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseLocation(direccion: string | null | undefined): { provincia: string; canton: string } {
  if (!direccion) return { provincia: 'San José', canton: 'San José' };
  try {
    const parsed = JSON.parse(direccion) as { provincia?: string; canton?: string };
    return {
      provincia: parsed.provincia ?? 'San José',
      canton: parsed.canton ?? 'San José',
    };
  } catch {
    const parts = direccion.split(', ');
    return { canton: parts[0] ?? 'San José', provincia: parts[1] ?? 'San José' };
  }
}

function parseJsonArray<T extends string>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as string[];
    const result = parsed.filter(Boolean) as T[];
    return result.length > 0 ? result : fallback;
  } catch {
    const result = raw.split(',').map((s) => s.trim()).filter(Boolean) as T[];
    return result.length > 0 ? result : fallback;
  }
}

function parseContacts(raw: string | null | undefined): Contact[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<{ name: string; role: string; email: string }>;
    return parsed.map((c) => ({
      name: c.name, role: c.role, email: c.email,
      initial: (c.name.trim().split(' ').map((n) => n[0]).join('').substring(0, 2) || 'C').toUpperCase(),
    }));
  } catch {
    return [];
  }
}

// ── SectionHeader sin botones de edición ──────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="flex items-center gap-3 font-heading text-xl font-bold tracking-tight text-ink-strong">
        {icon}
        {title}
      </h2>
    </div>
  );
}

// ── Project preview modal ──────────────────────────────────────────────────────
function ProjectModal({
  project,
  locale,
  onClose,
}: {
  project: ApiProject;
  locale: string;
  onClose: () => void;
}) {
  const t = useTranslations('mi_empresa');
  const skills = project.skills.map((s) => s.skill?.nombre).filter(Boolean);
  const extras = project.tecnologias_extra ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-[var(--shadow-elevated)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="space-y-1 min-w-0">
            <h2 className="font-heading text-xl font-extrabold tracking-tight text-ink-strong leading-tight">
              {project.titulo}
            </h2>
            {project.area && (
              <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {project.area.nombre}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 text-ink-muted hover:text-ink hover:bg-surface-sunken rounded-lg transition-colors"
            aria-label={t('public.close')}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Meta pills */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-surface-sunken border border-border px-3 py-1 text-xs font-semibold text-ink">
              <Calendar className="size-3.5 text-primary" />
              {t('public.days', { count: project.plazo_dias })}
            </span>
            {project.usa_ia && (
              <span className="flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                <Brain className="size-3.5" />
                {t('public.uses_ai')}
              </span>
            )}
            {project.n_ofertas !== undefined && (
              <span className="rounded-full bg-secondary/10 border border-secondary/20 px-3 py-1 text-xs font-semibold text-secondary">
                {t('public.offers', { count: project.n_ofertas })}
              </span>
            )}
          </div>

          {/* Descripcion */}
          <div>
            <p className="text-sm font-bold text-ink-strong mb-1">{t('public.description')}</p>
            <p className="text-sm leading-relaxed text-ink">{project.descripcion}</p>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <p className="text-sm font-bold text-ink-strong mb-2">{t('public.required_tech')}</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {s}
                  </span>
                ))}
                {extras.map((e) => (
                  <span key={e} className="rounded-full bg-highlight/15 px-2.5 py-0.5 text-xs font-semibold text-secondary">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-border text-sm font-semibold text-ink-muted hover:text-ink hover:border-border-strong transition-colors"
          >
            {t('public.close')}
          </button>
          <Link
            href={`/${locale}/marketplace/${project.id}`}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            {t('public.participate')}
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export function PublicEmpresaProfile({
  perfil,
  projects = [],
  locale = 'es',
  backLabel = 'Volver',
  backHref = '/marketplace',
}: {
  perfil: PublicEmpresaProfile;
  projects?: ApiProject[];
  locale?: string;
  backLabel?: string;
  backHref?: string;
}) {
  const t = useTranslations('mi_empresa');
  const tStage = useTranslations('register.emprendedor.step2');
  const tTechSupport = useTranslations('register.emprendedor.step3');
  const tBudget = useTranslations('register.emprendedor.step4');
  const tPT = useTranslations('register.empresa.step5');

  const [activeTab, setActiveTab] = useState<TabId>('empresa');
  const [previewProject, setPreviewProject] = useState<ApiProject | null>(null);

  const tipo = perfil.tipo;

  // Datos derivados (misma lógica que buildInitialData en mi-empresa.tsx)
  const { provincia, canton } = parseLocation(perfil.direccion);
  const sectors = parseJsonArray<string>(perfil.sector, []);
  const modalities = parseJsonArray<string>(perfil.modalidades, []);
  const projectTypes = parseJsonArray<ProjectType>(perfil.tipos_proyecto, []);
  const neededSupport = parseJsonArray<TechSupport>(perfil.apoyo_tecnico_necesario, []);
  const values = parseJsonArray<string>(perfil.valores, []);
  const contacts = parseContacts(perfil.contactos);

  const comercialName = perfil.nombre_comercial ?? '';
  const description = perfil.descripcion ?? '';
  const website = perfil.url_sitio_web ?? '';
  const empleados = perfil.cantidad_empleados ?? '';
  const scheduleType = (perfil.horario as 'flexible' | 'fixed' | null) ?? 'flexible';
  const stage = (perfil.etapa as StartupStage | null) ?? 'idea';
  const budget = (perfil.presupuesto as BudgetRange | null) ?? 'flexible';
  const mission = perfil.mision ?? '';
  const vision = perfil.vision ?? '';
  const culture = perfil.cultura ?? '';
  const projectDescription = perfil.descripcion ?? '';

  return (
    <div className="bg-canvas">

      {/* ── Hero banner — idéntico a EmpresaHeroBanner, sin botones de logo ── */}
      <div className="relative overflow-hidden bg-secondary px-6 pb-16 pt-10">
        <FwdGeoBackdrop />

        {/* Botón volver — dentro del hero, esquina superior izquierda */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 mb-6">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors duration-[var(--duration-fast)]"
          >
            <ChevronLeft className="size-4" />
            {backLabel}
          </Link>
        </div>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 md:flex-row md:items-center md:px-6">

          {/* Logo — solo vista, sin botones de subir/borrar */}
          <div className="shrink-0">
            <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-secondary-foreground/10 shadow-[var(--shadow-elevated)]">
              {perfil.url_logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={perfil.url_logo} alt={t('logo.alt')} className="size-full object-cover" />
              ) : (
                <Building2 className="size-14 text-highlight" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <Badge className="border-none bg-highlight font-bold text-secondary">
                {t(`badge.${tipo}`).toUpperCase()}
              </Badge>
              <h2 className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                {comercialName || (
                  <span className="opacity-40">{t('placeholders.company_name')}</span>
                )}
                <span className="text-primary">.</span>
              </h2>
            </div>
            {description && (
              <p className="max-w-2xl text-lg leading-relaxed text-white/80">{description}</p>
            )}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60 md:justify-start">
              {(canton || provincia) && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {canton}{canton && provincia ? ', ' : ''}{provincia}{provincia ? `, ${t('fields.country_value')}` : ''}
                </span>
              )}
              {tipo === 'empresa' && empleados && (
                <span className="flex items-center gap-1">
                  <Users className="size-4" />
                  {empleados} {t('fields.employees_unit')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab nav ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <nav role="tablist" className="flex gap-6">
            {(['empresa', 'proyectos'] as TabId[]).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'border-b-2 py-4 text-sm font-semibold transition-all cursor-pointer',
                  activeTab === tab
                    ? 'border-primary text-ink-strong'
                    : 'border-transparent text-ink-muted hover:text-ink',
                )}
              >
                {tab === 'empresa'
                  ? t(`badge.${tipo}`)
                  : `${t('public.projects_tab')}${projects.length > 0 ? ` (${projects.length})` : ''}`}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Tab: Empresa (contenido perfil) ─────────────────────────────────── */}
      {activeTab === 'empresa' && (
        <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

            {/* Left: main sections */}
            <div className="space-y-8 lg:col-span-2">

              {tipo === 'emprendedor' && (
                <>
                  <section className="space-y-4">
                    <SectionHeader icon={<Building2 className="size-6 text-primary" />} title={t('sections.general')} />
                    <Card className="space-y-5 border-border bg-surface p-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.project_name')}</label>
                          <p className="text-sm font-medium text-ink">{comercialName}</p>
                        </div>
                        <div>
                          <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.website')}</label>
                          <a href={website} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-start gap-1 text-sm font-medium text-primary hover:underline">
                            <Globe className="mt-0.5 size-4 shrink-0" /><span className="break-all">{website}</span>
                          </a>
                        </div>
                        <div>
                          <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.country')}</label>
                          <p className="text-sm font-medium text-ink">{t('fields.country_value')}</p>
                        </div>
                        <div>
                          <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.provincia')}</label>
                          <p className="text-sm font-medium text-ink">{provincia}</p>
                        </div>
                        <div>
                          <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.canton')}</label>
                          <p className="text-sm font-medium text-ink">{canton}</p>
                        </div>
                      </div>
                    </Card>
                  </section>

                  <section className="space-y-4">
                    <SectionHeader icon={<Target className="size-6 text-primary" />} title={t('sections.project_description')} />
                    <Card className="border-border bg-surface p-5">
                      <p className="text-sm leading-relaxed text-ink">
                        {projectDescription || <span className="italic text-ink-muted/60">{t('fields.project_description_placeholder')}</span>}
                      </p>
                    </Card>
                  </section>
                </>
              )}

              {tipo === 'empresa' && (
                <>
                  <section className="space-y-4">
                    <SectionHeader icon={<Building2 className="size-6 text-primary" />} title={t('sections.general')} />
                    <Card className="space-y-5 border-border bg-surface p-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.comercial_name')}</label>
                          <p className="text-sm font-medium text-ink">
                            {comercialName || <span className="italic text-ink-muted/60">{t('placeholders.company_name')}</span>}
                          </p>
                        </div>
                        <div>
                          <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.provincia')}</label>
                          <p className="text-sm font-medium text-ink">{provincia}</p>
                        </div>
                        <div>
                          <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.employees')}</label>
                          <p className="text-sm font-medium text-ink">{empleados} {t('fields.employees_unit')}</p>
                        </div>
                        <div>
                          <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.canton')}</label>
                          <p className="text-sm font-medium text-ink">{canton}</p>
                        </div>
                        <div>
                          <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.country')}</label>
                          <p className="text-sm font-medium text-ink">{t('fields.country_value')}</p>
                        </div>
                        <div>
                          <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.website')}</label>
                          <a href={website} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-start gap-1 text-sm font-medium text-primary hover:underline">
                            <Globe className="mt-0.5 size-4 shrink-0" /><span className="break-all">{website}</span>
                          </a>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <label className="font-body text-xs font-bold tracking-wide text-ink-muted">{t('fields.description')}</label>
                        <p className="mt-1 text-sm leading-relaxed text-ink">
                          {description || <span className="italic text-ink-muted/60">{t('placeholders.description')}</span>}
                        </p>
                      </div>

                      <div className="border-t border-border pt-4">
                        <p className="mb-3 font-body text-xs font-bold tracking-wide text-ink-muted">{t('sections.business_areas')}</p>
                        <div className="flex flex-wrap gap-2">
                          {sectors.map((area) => (
                            <span key={area}
                              className="rounded-full border border-secondary bg-secondary px-3 py-1 text-xs font-semibold text-white"
                            >
                              {area}
                            </span>
                          ))}
                          {sectors.length === 0 && (
                            <p className="text-xs text-ink-muted/60 italic">{t('public.no_sectors')}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </section>

                  <section className="space-y-4">
                    <SectionHeader icon={<Target className="size-6 text-primary" />} title={t('sections.culture')} />
                    <Card className="space-y-5 border-border bg-surface p-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <h3 className="font-body text-base font-bold tracking-wide text-secondary">{t('fields.mission')}</h3>
                          <p className="text-sm leading-relaxed text-ink">
                            {mission || <span className="italic text-ink-muted/60">{t('placeholders.mission')}</span>}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-body text-base font-bold tracking-wide text-secondary">{t('fields.vision')}</h3>
                          <p className="text-sm leading-relaxed text-ink">
                            {vision || <span className="italic text-ink-muted/60">{t('placeholders.vision')}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 border-t border-border pt-4">
                        <h3 className="font-body text-base font-bold tracking-wide text-secondary">{t('fields.organization')}</h3>
                        <p className="text-sm leading-relaxed text-ink">
                          {culture || <span className="italic text-ink-muted/60">{t('placeholders.culture')}</span>}
                        </p>
                      </div>
                      <div className="space-y-3 border-t border-border pt-4">
                        <h3 className="font-body text-base font-bold tracking-wide text-secondary">{t('fields.values')}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {values.map((v) => (
                            <Badge key={v} variant="secondary" className="flex items-center gap-1 border-secondary/10 bg-secondary/5 px-4 py-1 text-secondary">
                              {v}
                            </Badge>
                          ))}
                          {values.length === 0 && (
                            <>
                              {[t('placeholders.values_example_1'), t('placeholders.values_example_2'), t('placeholders.values_example_3')].map((v) => (
                                <Badge key={v} variant="secondary" className="border border-dashed border-secondary/25 bg-transparent px-4 py-1 italic text-secondary/40">{v}</Badge>
                              ))}
                              <p className="w-full text-xs italic text-ink-muted/60">{t('placeholders.values_hint')}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  </section>
                </>
              )}
            </div>

            {/* Right sidebar */}
            <aside className="space-y-8">
              {tipo === 'empresa' && (
                <section className="space-y-4">
                  <SectionHeader icon={<ShieldCheck className="size-5 text-primary" />} title={t('sections.needs')} />
                  <Card className="border-border bg-surface p-4">
                    <div className="flex flex-wrap gap-2">
                      {ALL_PROJECT_TYPES.map((pt) => {
                        const isSelected = projectTypes.includes(pt);
                        return (
                          <span key={pt}
                            className={cn(
                              'rounded-full border px-3 py-1.5 text-xs font-semibold',
                              isSelected ? 'border-primary bg-primary text-white' : 'border-border bg-canvas text-ink-muted',
                            )}
                          >
                            {tPT(pt)}
                          </span>
                        );
                      })}
                    </div>
                  </Card>
                </section>
              )}

              {tipo === 'emprendedor' && (
                <>
                  <section className="space-y-4">
                    <SectionHeader icon={<Target className="size-5 text-accent" />} title={t('sections.stage')} />
                    <div className="space-y-2">
                      {(['idea', 'mvp', 'validating', 'scaling'] as StartupStage[]).map((s) => {
                        const isSelected = stage === s;
                        return (
                          <div key={s} className={cn('flex w-full items-center gap-3 rounded-xl border p-3', isSelected ? 'border-accent bg-accent/10' : 'border-border bg-surface')}>
                            <span className={cn('flex size-4 shrink-0 items-center justify-center rounded-full border-2', isSelected ? 'border-accent' : 'border-border-strong')}>
                              {isSelected && <span className="size-2 rounded-full bg-accent" />}
                            </span>
                            <span className="flex flex-col gap-0.5">
                              <span className={cn('text-sm font-bold', isSelected ? 'text-accent' : 'text-ink-strong')}>{tStage(`${s}_label`)}</span>
                              <span className="text-[11px] text-ink-muted">{tStage(`${s}_description`)}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <SectionHeader icon={<ShieldCheck className="size-5 text-primary" />} title={t('sections.tech_support')} />
                    <Card className="border-border bg-surface p-5">
                      <div className="flex flex-wrap gap-2">
                        {(['web', 'mobile', 'backend', 'ai', 'ux', 'data', 'automation', 'other'] as TechSupport[]).map((ts) => {
                          const isSelected = neededSupport.includes(ts);
                          return (
                            <span key={ts}
                              className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold', isSelected ? 'border-primary bg-primary text-white' : 'border-border bg-canvas text-ink-muted')}
                            >
                              {tTechSupport(ts)}
                            </span>
                          );
                        })}
                      </div>
                    </Card>
                  </section>

                  <section className="space-y-4">
                    <SectionHeader icon={<Target className="size-5 text-highlight" />} title={t('sections.budget')} />
                    <div className="space-y-2">
                      {(['under_500', 'range_500_1000', 'range_1000_2500', 'flexible'] as BudgetRange[]).map((b) => {
                        const isSelected = budget === b;
                        return (
                          <div key={b} className={cn('flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium', isSelected ? 'border-highlight bg-highlight/10 font-bold text-secondary' : 'border-border bg-surface text-ink-muted')}>
                            {tBudget(b)}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              <section className="space-y-4">
                <SectionHeader icon={<Clock className="size-5 text-warning" />} title={t('sections.modalities')} />
                <div className="grid grid-cols-2 gap-3">
                  {(['remote', 'hybrid', 'onsite', 'nomad'] as const).map((m) => {
                    const isActive = modalities.includes(m);
                    return (
                      <div key={m} className={cn('select-none rounded-xl border p-3 text-center text-[10px] font-bold uppercase tracking-tighter', isActive ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-surface text-ink-muted')}>
                        {t(`modalities.${m}`)}
                      </div>
                    );
                  })}
                </div>
                <Card className="flex select-none items-center gap-3 border-border bg-surface-sunken p-4">
                  <Clock className="size-5 text-warning" />
                  <div>
                    <p className="text-xs font-bold text-ink-strong">
                      {scheduleType === 'flexible' ? t('schedules.flexible') : t('schedules.fixed')}
                    </p>
                    <p className="text-[10px] text-ink-muted">{t('schedules.timezone')}</p>
                  </div>
                </Card>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-lg font-bold tracking-tight text-ink-strong">{t('sections.contacts')}</h2>
                <div className="space-y-3">
                  {contacts.map((contact, i) => (
                    <Card key={i} className="flex items-center gap-4 border-border bg-surface p-4">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-secondary font-bold text-white">{contact.initial}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink-strong">{contact.name}</p>
                        <p className="truncate text-[10px] tracking-wide text-ink-muted">{contact.role}</p>
                        <p className="truncate text-[10px] text-primary underline">{contact.email}</p>
                      </div>
                    </Card>
                  ))}
                  {contacts.length === 0 && (
                    <>
                      <Card className="flex items-center gap-4 border border-dashed border-border bg-surface/50 p-4 opacity-50">
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-secondary/20 font-bold text-secondary/50">AR</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold italic text-ink-muted/70">{t('placeholders.contact_example_name')}</p>
                          <p className="truncate text-[10px] tracking-wide text-ink-muted/60">{t('placeholders.contact_example_role')}</p>
                          <p className="truncate text-[10px] italic text-primary/50">{t('placeholders.contact_example_email')}</p>
                        </div>
                      </Card>
                      <p className="text-xs italic text-ink-muted/60">{t('placeholders.contact_hint')}</p>
                    </>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </main>
      )}

      {/* ── Tab: Proyectos ────────────────────────────────────────────────────── */}
      {activeTab === 'proyectos' && (
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-16 text-center">
              <Building2 className="mx-auto mb-3 size-10 text-ink-muted/30" />
              <p className="text-sm italic text-ink-muted">{t('public.no_projects')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const skills = project.skills.map((s) => s.skill?.nombre).filter(Boolean).slice(0, 3);
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setPreviewProject(project)}
                    className="text-left rounded-2xl border border-border bg-surface shadow-soft hover:shadow-md hover:border-primary/30 transition-all p-5 space-y-3 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-base font-extrabold text-ink-strong leading-tight">{project.titulo}</h3>
                      {project.usa_ia && (
                        <span className="shrink-0 flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent border border-accent/20">
                          <Brain className="size-3" /> IA
                        </span>
                      )}
                    </div>
                    {project.area && (
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                        {project.area.nombre}
                      </span>
                    )}
                    <p className="text-xs text-ink line-clamp-2 leading-relaxed">{project.descripcion}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skills.map((s) => (
                        <span key={s} className="rounded-full bg-surface-sunken border border-border px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-1 border-t border-border/50 text-[11px] text-ink-muted">
                      <span className="flex items-center gap-1"><Calendar className="size-3" /> {t('public.days', { count: project.plazo_dias })}</span>
                      {project.n_ofertas !== undefined && (
                        <span>{t('public.offers', { count: project.n_ofertas })}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* Preview modal */}
      {previewProject && (
        <ProjectModal
          project={previewProject}
          locale={locale}
          onClose={() => setPreviewProject(null)}
        />
      )}
    </div>
  );
}
