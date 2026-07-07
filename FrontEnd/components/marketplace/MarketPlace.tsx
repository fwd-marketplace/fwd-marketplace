'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
    LayoutGrid,
    Cloud,
    Smartphone,
    LineChart,
    GraduationCap,
    HeartPulse,
    Truck,
    Megaphone,
    ShoppingCart,
    Briefcase,
    Search,
    Bookmark,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketplaceHeroBackdrop } from '@/components/marketplace/MarketplaceHeroBackdrop';
import { HeroJourneyBadge } from '@/components/ui/HeroJourneyBadge';
import { buildSparklePoints } from '@/lib/logo-constellation';
import { ProjectPreviewModal } from '@/components/marketplace/ProjectPreviewModal';

const CONTENT_SPARKLE_POINTS = buildSparklePoints(12, 12, 12);
import { Button } from '@/components/ui/button';
import { saveProjectAction, unsaveProjectAction } from '@/lib/actions/marketplace';
import { formatCompensacion, isInCompensacionBucket, type CompensacionBucket } from '@/lib/marketplace/compensation';
import type { ApiProject, ApiRoleName, CatalogsResponse } from '@/lib/api/types';

const PAGE_SIZE = 9;


// Los proyectos tienen un plazo de 5 a 15 días (CHECK en DB). Los buckets se ajustan a
// ese rango real; con los valores viejos (0-30/31-60/61+) "medio" y "amplio" quedaban vacíos.
const DURATION_RANGES = {
    short: { min: 5, max: 7 },
    medium: { min: 8, max: 11 },
    long: { min: 12, max: 15 },
} as const;

type DurationBucket = keyof typeof DURATION_RANGES;
type SortOrder = 'sort_recent_desc' | 'sort_duration_asc';

const BRAND_COLORS = [
    'text-magenta',
    'text-accent',
    'text-highlight',
    'text-warning',
    'text-primary',
] as const;

// Mapas de color para el borde superior y el badge por área.
const COLOR_TO_VAR: Record<string, string> = {
    'text-magenta':   'var(--magenta)',
    'text-accent':    'var(--accent)',
    'text-highlight': 'var(--highlight)',
    'text-warning':   'var(--warning)',
    'text-primary':   'var(--primary)',
};
const COLOR_TO_BG: Record<string, string> = {
    'text-magenta':   'bg-magenta/10',
    'text-accent':    'bg-accent/10',
    'text-highlight': 'bg-highlight/10',
    'text-warning':   'bg-warning/10',
    'text-primary':   'bg-primary/10',
};

const AREA_ICONS = [LayoutGrid, LineChart, Cloud, Smartphone, GraduationCap, HeartPulse, Truck, Megaphone, ShoppingCart, Briefcase] as const;

interface FilterOption {
    value: string;
    label: string;
}

/**
 * Replica exacta de computeMatchScore del BackEnd (match.service.ts).
 * Función pura: skills del proyecto vs skills del estudiante + disponibilidad + reputación.
 */
function computeMatchScore(
    projectSkills: string[],
    studentSkills: string[],
    disponible: boolean,
    reputacion: number | null = null,
): number {
    const studentSet = new Set(studentSkills.map((s) => s.toLowerCase()));
    const matched = projectSkills.filter((s) => studentSet.has(s.toLowerCase()));
    const cobertura = projectSkills.length > 0 ? matched.length / projectSkills.length : 0.5;
    const base = cobertura * 80 + (disponible ? 20 : 0);
    const repBonus = reputacion != null ? (reputacion / 5) * 10 : 0;
    return Math.min(100, Math.round(base + repBonus));
}


interface Props {
    initialProjects: ApiProject[];
    catalogs: CatalogsResponse;
    role?: ApiRoleName | null;
    appliedProjectIds?: string[];
    initialSavedIds?: string[];
    studentSkills?: string[];
    studentDisponible?: boolean;
    studentReputacion?: number | null;
}

function isExpired(fechaCierre: string | null): boolean {
    if (!fechaCierre) return false;
    return new Date(fechaCierre) < new Date();
}

const AREA_COLOR_OVERRIDE: Record<string, string> = {
    'ventas':      'text-magenta',
    'operaciones': 'text-accent',
};

function getAreaColor(areaId: string, areas: CatalogsResponse['areas']): string {
    const index = areas.findIndex((a) => a.id === areaId);
    const area = areas[index];
    if (area) {
        const key = area.nombre.toLowerCase().trim();
        if (key in AREA_COLOR_OVERRIDE) return AREA_COLOR_OVERRIDE[key]!;
    }
    return BRAND_COLORS[index >= 0 ? index % BRAND_COLORS.length : 0] ?? 'text-magenta';
}

function getAreaIcon(areaId: string, areas: CatalogsResponse['areas'], colorClass: string): ReactNode {
    const index = areas.findIndex((a) => a.id === areaId);
    const Icon = AREA_ICONS[index >= 0 ? index % AREA_ICONS.length : 0] ?? Briefcase;
    return <Icon className={`w-5 h-5 ${colorClass}`} />;
}

function isNewProject(fechaPublicacion: string | null): boolean {
    if (!fechaPublicacion) return false;
    const MS_PER_DAY = 86_400_000;
    return Date.now() - new Date(fechaPublicacion).getTime() < 7 * MS_PER_DAY;
}

function FilterDropdown({
    triggerLabel,
    value,
    options,
    onChange,
    allLabel,
}: {
    triggerLabel: string;
    value: string | null;
    options: readonly FilterOption[];
    onChange: (value: string | null) => void;
    allLabel?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const selected = options.find((o) => o.value === value) ?? null;

    return (
        <div className="relative">
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((o) => !o)}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
                    selected ? 'bg-primary/10 text-primary' : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
                }`}
            >
                {selected ? selected.label : triggerLabel}
                <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {isOpen && (
                <>
                    <button
                        type="button"
                        aria-hidden="true"
                        tabIndex={-1}
                        className="fixed inset-0 z-30 cursor-default"
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        role="listbox"
                        className="absolute left-0 z-40 mt-2 min-w-44 max-h-64 overflow-y-auto overflow-hidden rounded-2xl border border-border bg-surface p-1 shadow-elevated"
                    >
                        {allLabel && (
                            <button
                                type="button"
                                onClick={() => { onChange(null); setIsOpen(false); }}
                                className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken ${
                                    value === null ? 'font-semibold text-primary' : 'text-ink'
                                }`}
                            >
                                {allLabel}
                            </button>
                        )}
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => { onChange(option.value); setIsOpen(false); }}
                                className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-surface-sunken ${
                                    option.value === value ? 'font-semibold text-primary' : 'text-ink'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function MarketPlace({ initialProjects, catalogs, role = 'student', appliedProjectIds = [], initialSavedIds = [], studentSkills = [], studentDisponible = true, studentReputacion = null }: Props) {
    const t = useTranslations('marketplace_page');
    const locale = useLocale();

    const projects = initialProjects;
    const activeCatalogs = catalogs;

    const [searchQuery, setSearchQuery] = useState('');
    const [activeArea, setActiveArea] = useState<string | null>(null);
    const [activeDuration, setActiveDuration] = useState<string | null>(null);
    const [activePrice, setActivePrice] = useState<string | null>(null);
    const [activeSkill, setActiveSkill] = useState<string | null>(null);
    const [showAiOnly, setShowAiOnly] = useState(false);
    const [sortOrder, setSortOrder] = useState<SortOrder>('sort_recent_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [savedProjectIds, setSavedProjectIds] = useState<ReadonlySet<string>>(new Set(initialSavedIds));
    const [previewProject, setPreviewProject] = useState<ApiProject | null>(null);

    const areaOptions: FilterOption[] = activeCatalogs.areas.map((a) => ({ value: a.id, label: a.nombre }));
    const skillOptions: FilterOption[] = activeCatalogs.skills
        .slice()
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map((s) => ({ value: s.id, label: s.nombre }));

    const durationOptions: FilterOption[] = [
        { value: 'short', label: t('duration_short') },
        { value: 'medium', label: t('duration_medium') },
        { value: 'long', label: t('duration_long') },
    ];

    const priceOptions: FilterOption[] = [
        { value: 'low', label: t('budget_low') },
        { value: 'mid', label: t('budget_mid') },
        { value: 'high', label: t('budget_high') },
    ];

    const sortOptions: FilterOption[] = [
        { value: 'sort_recent_desc', label: t('sort_recent_desc') },
        { value: 'sort_duration_asc', label: t('sort_duration_asc') },
    ];

    const filteredProjects = useMemo(() => {
        const matching = projects.filter((project) => {
            if (searchQuery) {
                const q = searchQuery.trim().toLowerCase();
                const haystack = [
                    project.titulo,
                    project.descripcion,
                    project.area?.nombre ?? '',
                    project.empresa?.nombre_comercial ?? '',
                    ...project.skills.flatMap((s) => (s.skill ? [s.skill.nombre] : [])),
                ]
                    .join(' ')
                    .toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            if (activeArea && project.area?.id !== activeArea) return false;
            if (activeDuration) {
                const range = DURATION_RANGES[activeDuration as DurationBucket];
                if (!range || project.plazo_dias < range.min || project.plazo_dias > range.max) return false;
            }
            if (activeSkill && !project.skills.some((s) => s.skill?.id === activeSkill)) return false;
            if (activePrice && !isInCompensacionBucket(project.compensacion, activePrice as CompensacionBucket)) return false;
            if (showAiOnly && !project.usa_ia) return false;
            return true;
        });

        if (sortOrder === 'sort_duration_asc') {
            return [...matching].sort((a, b) => a.plazo_dias - b.plazo_dias);
        }
        return [...matching].sort((a, b) =>
            (b.fecha_publicacion ?? '').localeCompare(a.fecha_publicacion ?? ''),
        );
    }, [projects, searchQuery, activeArea, activeDuration, activePrice, activeSkill, showAiOnly, sortOrder]);

    const totalResults = filteredProjects.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pageProjects = filteredProjects.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const hasActiveFilters =
        searchQuery !== '' ||
        activeArea !== null ||
        activeDuration !== null ||
        activePrice !== null ||
        activeSkill !== null ||
        showAiOnly;

    function resetToFirstPage() {
        setCurrentPage(1);
    }

    function clearAllFilters() {
        setSearchQuery('');
        setActiveArea(null);
        setActiveDuration(null);
        setActivePrice(null);
        setActiveSkill(null);
        setShowAiOnly(false);
        resetToFirstPage();
    }

    async function toggleSaved(projectId: string) {
        const wasSaved = savedProjectIds.has(projectId);
        // Optimistic update — apply immediately before API call
        setSavedProjectIds((current) => {
            const next = new Set(current);
            if (wasSaved) {
                next.delete(projectId);
            } else {
                next.add(projectId);
            }
            return next;
        });
        try {
            if (wasSaved) {
                await unsaveProjectAction(projectId);
            } else {
                await saveProjectAction(projectId);
            }
        } catch {
            // Rollback on failure
            setSavedProjectIds((current) => {
                const next = new Set(current);
                if (wasSaved) {
                    next.add(projectId);
                } else {
                    next.delete(projectId);
                }
                return next;
            });
        }
    }

    return (
        <>
        <div className="bg-marketplace-sky relative text-ink font-body">

            {/* Hero — backdrop is contained here so it never stretches with the cards */}
            <section className="relative overflow-hidden z-10 px-6 pt-10 pb-16 md:pt-14 md:pb-20">
                <MarketplaceHeroBackdrop />
                <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 text-left">
                    <HeroJourneyBadge
                        stage="desafio"
                        label={t('hero_journey_label')}
                        cta={t('hero_journey_cta')}
                        achievedCta={t('hero_journey_cta_achieved')}
                        achieved={appliedProjectIds.length > 0}
                    />
                    <h1 className="mt-4 font-heading text-4xl md:text-5xl font-bold tracking-tight text-white">
                        {t('hero_title')}<span className="text-primary" aria-hidden="true">.</span>
                    </h1>
                    <p className="mt-3 text-sm md:text-base text-white/80 leading-relaxed">
                        {t('hero_subtitle')}
                    </p>
                </div>
            </section>

        </div>{/* end blue zone */}

        {/* Search + filters — straddles the blue/white boundary */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 -mt-7">
                <div className="flex flex-col gap-4 rounded-2xl bg-white px-3 py-3 shadow-elevated md:flex-row md:items-center md:gap-2 md:py-2 md:pl-6 md:pr-2">
                    <div className="flex flex-1 items-center gap-3">
                        <Search className="w-4 h-4 shrink-0 text-ink-muted" aria-hidden="true" />
                        <label htmlFor="marketplace-search" className="sr-only">{t('search_label')}</label>
                        <input
                            id="marketplace-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); resetToFirstPage(); }}
                            placeholder={t('search_placeholder')}
                            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <FilterDropdown
                            triggerLabel={t('filter_area')}
                            value={activeArea}
                            options={areaOptions}
                            allLabel={t('filter_all')}
                            onChange={(v) => { setActiveArea(v); resetToFirstPage(); }}
                        />
                        <FilterDropdown
                            triggerLabel={t('filter_duration')}
                            value={activeDuration}
                            options={durationOptions}
                            allLabel={t('filter_all')}
                            onChange={(v) => { setActiveDuration(v); resetToFirstPage(); }}
                        />
                        <FilterDropdown
                            triggerLabel={t('filter_budget')}
                            value={activePrice}
                            options={priceOptions}
                            allLabel={t('filter_all')}
                            onChange={(v) => { setActivePrice(v); resetToFirstPage(); }}
                        />
                        <FilterDropdown
                            triggerLabel={t('filter_skills')}
                            value={activeSkill}
                            options={skillOptions}
                            allLabel={t('filter_all')}
                            onChange={(v) => { setActiveSkill(v); resetToFirstPage(); }}
                        />
                        <button
                            type="button"
                            aria-pressed={showAiOnly}
                            onClick={() => { setShowAiOnly((c) => !c); resetToFirstPage(); }}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
                                showAiOnly ? 'bg-primary/10 text-primary' : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
                            }`}
                        >
                            {t('filter_ai_projects')}
                        </button>
                        <FilterDropdown
                            triggerLabel={t('filter_sort')}
                            value={sortOrder}
                            options={sortOptions}
                            onChange={(v) => { if (v) setSortOrder(v as SortOrder); }}
                        />
                    </div>
                </div>
            </div>

        <div className="bg-white pb-20">
            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 relative z-10">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <p className="text-sm font-semibold text-ink-muted">
                        {t('results_count', { count: totalResults })}
                    </p>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearAllFilters}
                            className="text-sm font-semibold text-primary hover:underline"
                        >
                            {t('clear_filters')}
                        </button>
                    )}
                </div>

                {totalResults === 0 ? (
                    <div className="rounded-2xl border border-border bg-surface p-12 text-center">
                        <h2 className="font-heading text-xl font-bold text-ink-strong mb-2">{t('no_results_title')}</h2>
                        <p className="text-ink-muted text-sm mb-6">{t('no_results_body')}</p>
                        <Button variant="outline" className="rounded-full px-6" onClick={clearAllFilters}>
                            {t('clear_filters')}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pageProjects.map((project) => {
                            const isSaved = savedProjectIds.has(project.id);
                            const hasApplied = appliedProjectIds.includes(project.id);
                            const expired = isExpired(project.fecha_cierre);
                            const isNew = isNewProject(project.fecha_publicacion);
                            const colorClass = project.area
                                ? getAreaColor(project.area.id, activeCatalogs.areas)
                                : 'text-primary';
                            const skills = project.skills.flatMap((s) => (s.skill ? [s.skill] : []));
                            const borderColor = COLOR_TO_VAR[colorClass] ?? 'var(--primary)';
                            const durationWeeks = Math.ceil(project.plazo_dias / 7);

                            const icon = project.area
                                ? getAreaIcon(project.area.id, activeCatalogs.areas, colorClass)
                                : <Briefcase className={`w-5 h-5 ${colorClass}`} />;

                            const projectSkillNames = project.skills.flatMap((s) => s.skill ? [s.skill.nombre] : []);
                            const matchScore = studentSkills.length > 0
                                ? computeMatchScore(projectSkillNames, studentSkills, studentDisponible, studentReputacion)
                                : null;
                            const matchBorderClass = colorClass.replace('text-', 'border-');

                            return (
                                <div
                                    key={project.id}
                                    role="article"
                                    tabIndex={expired ? undefined : 0}
                                    onClick={() => !expired && setPreviewProject(project)}
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter' || e.key === ' ') && !expired) {
                                            e.preventDefault();
                                            setPreviewProject(project);
                                        }
                                    }}
                                    className={cn(
                                        'group relative bg-surface rounded-2xl border border-border border-t-[5px] flex flex-col',
                                        'shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elevated)] hover:border-border-strong transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]',
                                        expired ? 'cursor-default opacity-75' : 'cursor-pointer',
                                    )}
                                    style={{ borderTopColor: borderColor }}
                                >
                                    {/* Top row: icono + categoría | círculo match */}
                                    <div className="flex items-center justify-between px-5 pt-5 mb-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border border-border shrink-0', COLOR_TO_BG[colorClass] ?? 'bg-primary/10')}>
                                                {icon}
                                            </div>
                                            <span className={cn('text-[11px] font-bold uppercase tracking-wider truncate', colorClass)}>
                                                {project.area?.nombre ?? '—'}
                                            </span>
                                        </div>
                                        {matchScore !== null && (
                                            <div className="flex flex-col items-center shrink-0 ml-3">
                                                <div className={cn('relative flex h-12 w-12 items-center justify-center rounded-full border-4', matchBorderClass)}>
                                                    <span className={cn('font-bold text-sm', colorClass)}>
                                                        {matchScore}%
                                                    </span>
                                                </div>
                                                <span className={cn('text-[10px] mt-1 font-medium', colorClass)}>{t('match_label')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Title + company + description */}
                                    <div className="px-5 flex-1">
                                        <h3 className="font-heading text-[17px] font-bold text-ink-strong mb-0.5 leading-tight">
                                            {project.titulo}
                                        </h3>
                                        {project.empresa && (
                                            <p className="text-xs text-ink-muted mb-2">
                                                {project.empresa.nombre_comercial}
                                            </p>
                                        )}
                                        <p className="text-sm text-ink-muted leading-relaxed line-clamp-3 mb-4">
                                            {project.descripcion}
                                        </p>

                                        {/* Skills como texto separado por puntos */}
                                        {skills.length > 0 && (
                                            <p className={cn('text-sm font-semibold mb-5', colorClass)}>
                                                {skills.slice(0, 4).map((s) => s.nombre).join(' · ')}
                                                {skills.length > 4 ? ' · …' : ''}
                                            </p>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className="mx-5 border-t border-border" />

                                    {/* Footer: metadata */}
                                    <div className="px-5 py-3.5 flex items-center gap-4 text-xs text-ink-muted">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                                            {durationWeeks} {t('weeks_unit')}
                                        </span>
                                        {project.compensacion != null && (
                                            <span className="flex items-center gap-1.5">
                                                <Briefcase className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                                                {formatCompensacion(project.compensacion, project.moneda)}
                                            </span>
                                        )}
                                        {project.usa_ia && (
                                            <span className={cn('flex items-center gap-1', colorClass)}>
                                                <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                                                {t('badge_ia')}
                                            </span>
                                        )}
                                    </div>

                                    {/* Acciones */}
                                    <div className="px-5 pb-5 flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={expired}
                                            onClick={(e) => { e.stopPropagation(); if (!expired) setPreviewProject(project); }}
                                            className={cn(
                                                'flex-1 rounded-full px-5 py-2.5 text-sm font-semibold text-center transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                                                expired
                                                    ? 'bg-surface-sunken text-ink-muted cursor-not-allowed'
                                                    : 'bg-secondary text-white hover:bg-secondary/80',
                                            )}
                                        >
                                            {expired ? t('badge_expired') : hasApplied ? t('view_my_offer') : t('view_project')}
                                        </button>
                                        <button
                                            type="button"
                                            aria-label={isSaved ? t('saved_project') : t('save_project')}
                                            aria-pressed={isSaved}
                                            onClick={(e) => { e.stopPropagation(); void toggleSaved(project.id); }}
                                            className={cn(
                                                'size-10 shrink-0 flex items-center justify-center rounded-full border transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                                                isSaved
                                                    ? 'bg-highlight border-highlight text-ink-strong'
                                                    : 'border-border text-ink-muted hover:bg-highlight hover:border-highlight hover:text-ink-strong',
                                            )}
                                        >
                                            <Bookmark className={cn('w-4 h-4', isSaved ? 'fill-ink-strong' : 'fill-none')} aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <nav className="flex justify-center items-center gap-1.5 mt-12" aria-label={t('eyebrow')}>
                        <button
                            type="button"
                            aria-label={t('pagination_prev')}
                            disabled={safePage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-ink-muted bg-transparent hover:bg-surface-sunken transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                type="button"
                                aria-label={t('pagination_page', { page })}
                                aria-current={page === safePage ? 'page' : undefined}
                                onClick={() => setCurrentPage(page)}
                                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
                                    page === safePage
                                        ? 'bg-primary text-white border border-primary'
                                        : 'border border-border text-ink-muted bg-transparent hover:bg-surface-sunken'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            type="button"
                            aria-label={t('pagination_next')}
                            disabled={safePage === totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-ink-muted bg-transparent hover:bg-surface-sunken transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </nav>
                )}
            </div>

        </div>

        {previewProject && (
            <ProjectPreviewModal
                project={previewProject}
                onClose={() => setPreviewProject(null)}
            />
        )}
        </>
    );
}

