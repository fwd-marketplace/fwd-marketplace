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
    Sparkles,
    Search,
    Bookmark,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Clock,
    ExternalLink,
    Zap,
    X,
} from 'lucide-react';
import { MarketplaceHeroBackdrop } from '@/components/marketplace/MarketplaceHeroBackdrop';
import { ProjectDetailSheet } from '@/components/marketplace/ProjectDetailSheet';
import { Button } from '@/components/ui/button';
import type { ApiProject, ApiRoleName, CatalogsResponse } from '@/lib/api/types';

const PAGE_SIZE = 6;

const MOCK_AREA_ID = {
    fintech: 'mock-area-1',
    salud: 'mock-area-2',
    ecommerce: 'mock-area-3',
    logistica: 'mock-area-4',
    edutech: 'mock-area-5',
    marketing: 'mock-area-6',
} as const;

const MOCK_CATALOGS: CatalogsResponse = {
    areas: [
        { id: MOCK_AREA_ID.fintech, nombre: 'Fintech' },
        { id: MOCK_AREA_ID.salud, nombre: 'Salud' },
        { id: MOCK_AREA_ID.ecommerce, nombre: 'E-Commerce' },
        { id: MOCK_AREA_ID.logistica, nombre: 'Logística' },
        { id: MOCK_AREA_ID.edutech, nombre: 'Edutech' },
        { id: MOCK_AREA_ID.marketing, nombre: 'Marketing' },
    ],
    skills: [
        { id: 'sk-1', nombre: 'React', tipo: 'frontend', categoria: null },
        { id: 'sk-2', nombre: 'Node.js', tipo: 'backend', categoria: null },
        { id: 'sk-3', nombre: 'Python', tipo: 'backend', categoria: null },
        { id: 'sk-4', nombre: 'TypeScript', tipo: 'frontend', categoria: null },
        { id: 'sk-5', nombre: 'PostgreSQL', tipo: 'backend', categoria: null },
        { id: 'sk-6', nombre: 'React Native', tipo: 'mobile', categoria: null },
    ],
    projectStates: [],
    conocimientos: [],
};

const MOCK_PROJECTS: ApiProject[] = [
    {
        id: 'mock-1',
        titulo: 'Sistema de Gestión de Créditos',
        descripcion: 'Rediseño integral de la plataforma B2B para optimizar flujos de aprobación y visualización de KPIs financieros en tiempo real.',
        usa_ia: true,
        plazo_dias: 15,
        fecha_publicacion: '2026-06-10T00:00:00Z',
        fecha_cierre: null,
        estado: { nombre: 'en_recepcion' },
        area: { id: MOCK_AREA_ID.fintech, nombre: 'Fintech' },
        empresa: { nombre_comercial: 'BancaCR Digital', tipo: 'empresa' },
        skills: [
            { skill: { id: 'sk-1', nombre: 'React', tipo: 'frontend', categoria: null } },
            { skill: { id: 'sk-3', nombre: 'Python', tipo: 'backend', categoria: null } },
            { skill: { id: 'sk-5', nombre: 'PostgreSQL', tipo: 'backend', categoria: null } },
        ],
    },
    {
        id: 'mock-2',
        titulo: 'Plataforma de Telemedicina',
        descripcion: 'Módulo de citas virtuales con videollamada integrada, historial clínico y recordatorios automáticos para pacientes y médicos.',
        usa_ia: false,
        plazo_dias: 12,
        fecha_publicacion: '2026-06-08T00:00:00Z',
        fecha_cierre: null,
        estado: { nombre: 'en_recepcion' },
        area: { id: MOCK_AREA_ID.salud, nombre: 'Salud' },
        empresa: { nombre_comercial: 'MediConnect CR', tipo: 'empresa' },
        skills: [
            { skill: { id: 'sk-2', nombre: 'Node.js', tipo: 'backend', categoria: null } },
            { skill: { id: 'sk-4', nombre: 'TypeScript', tipo: 'frontend', categoria: null } },
        ],
    },
    {
        id: 'mock-3',
        titulo: 'App de Seguimiento de Pedidos',
        descripcion: 'Aplicación móvil para que clientes rastreen sus pedidos en tiempo real con notificaciones push y mapa de ruta del repartidor.',
        usa_ia: false,
        plazo_dias: 10,
        fecha_publicacion: '2026-06-05T00:00:00Z',
        fecha_cierre: null,
        estado: { nombre: 'en_recepcion' },
        area: { id: MOCK_AREA_ID.ecommerce, nombre: 'E-Commerce' },
        empresa: { nombre_comercial: 'ShopRápido', tipo: 'emprendedor' },
        skills: [
            { skill: { id: 'sk-6', nombre: 'React Native', tipo: 'mobile', categoria: null } },
            { skill: { id: 'sk-2', nombre: 'Node.js', tipo: 'backend', categoria: null } },
        ],
    },
    {
        id: 'mock-4',
        titulo: 'Dashboard de Métricas de Distribución',
        descripcion: 'Panel interactivo para supervisores de flota con métricas de entregas, rutas óptimas y alertas de desviación en tiempo real.',
        usa_ia: true,
        plazo_dias: 14,
        fecha_publicacion: '2026-06-03T00:00:00Z',
        fecha_cierre: null,
        estado: { nombre: 'en_recepcion' },
        area: { id: MOCK_AREA_ID.logistica, nombre: 'Logística' },
        empresa: { nombre_comercial: 'FleetOps Latam', tipo: 'empresa' },
        skills: [
            { skill: { id: 'sk-1', nombre: 'React', tipo: 'frontend', categoria: null } },
            { skill: { id: 'sk-4', nombre: 'TypeScript', tipo: 'frontend', categoria: null } },
            { skill: { id: 'sk-3', nombre: 'Python', tipo: 'backend', categoria: null } },
        ],
    },
    {
        id: 'mock-5',
        titulo: 'Plataforma de Cursos en Vivo',
        descripcion: 'Aulas virtuales con video en tiempo real, pizarra colaborativa y seguimiento de progreso por estudiante y módulo.',
        usa_ia: false,
        plazo_dias: 15,
        fecha_publicacion: '2026-06-01T00:00:00Z',
        fecha_cierre: null,
        estado: { nombre: 'en_recepcion' },
        area: { id: MOCK_AREA_ID.edutech, nombre: 'Edutech' },
        empresa: { nombre_comercial: 'AprenderCR', tipo: 'emprendedor' },
        skills: [
            { skill: { id: 'sk-1', nombre: 'React', tipo: 'frontend', categoria: null } },
            { skill: { id: 'sk-2', nombre: 'Node.js', tipo: 'backend', categoria: null } },
        ],
    },
    {
        id: 'mock-6',
        titulo: 'Automatización de Reportes de Campaña',
        descripcion: 'Herramienta que conecta con Google Ads y Meta Ads para generar reportes automáticos con visualizaciones y exportación a PDF.',
        usa_ia: true,
        plazo_dias: 8,
        fecha_publicacion: '2026-05-28T00:00:00Z',
        fecha_cierre: null,
        estado: { nombre: 'en_recepcion' },
        area: { id: MOCK_AREA_ID.marketing, nombre: 'Marketing' },
        empresa: { nombre_comercial: 'GrowthLab CR', tipo: 'empresa' },
        skills: [
            { skill: { id: 'sk-3', nombre: 'Python', tipo: 'backend', categoria: null } },
            { skill: { id: 'sk-4', nombre: 'TypeScript', tipo: 'frontend', categoria: null } },
        ],
    },
];

const DURATION_RANGES = {
    short: { min: 0, max: 30 },
    medium: { min: 31, max: 60 },
    long: { min: 61, max: Number.POSITIVE_INFINITY },
} as const;

type DurationBucket = keyof typeof DURATION_RANGES;
type SortOrder = 'sort_recent_desc' | 'sort_duration_asc';

const BRAND_COLORS = [
    'text-primary',
    'text-magenta',
    'text-accent',
    'text-warning',
    'text-secondary',
] as const;

const AREA_ICONS = [LayoutGrid, LineChart, Cloud, Smartphone, GraduationCap, HeartPulse, Truck, Megaphone, ShoppingCart, Briefcase] as const;

interface FilterOption {
    value: string;
    label: string;
}

interface Props {
    initialProjects: ApiProject[];
    catalogs: CatalogsResponse;
    role?: ApiRoleName | null;
    appliedProjectIds?: string[];
}

function isExpired(fechaCierre: string | null): boolean {
    if (!fechaCierre) return false;
    return new Date(fechaCierre) < new Date();
}

function getAreaColor(areaId: string, areas: CatalogsResponse['areas']): string {
    const index = areas.findIndex((a) => a.id === areaId);
    return BRAND_COLORS[index >= 0 ? index % BRAND_COLORS.length : 0] ?? 'text-primary';
}

function getAreaIcon(areaId: string, areas: CatalogsResponse['areas'], colorClass: string): ReactNode {
    const index = areas.findIndex((a) => a.id === areaId);
    const Icon = AREA_ICONS[index >= 0 ? index % AREA_ICONS.length : 0] ?? Briefcase;
    return <Icon className={`w-6 h-6 ${colorClass}`} />;
}

function getMatchColor(match: number): string {
    if (match >= 85) return 'bg-accent/10 text-accent';
    if (match >= 70) return 'bg-primary/10 text-primary';
    return 'bg-magenta/10 text-magenta';
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
                    selected ? 'bg-white/25 text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'
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

/** Modal showing the full detail of a project when "Ver proyecto" is pressed (pull branch). */
function ProjectDetailModal({ project, onClose }: { project: ApiProject; onClose: () => void }) {
    const t = useTranslations('marketplace_page');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                aria-label={t('close')}
                onClick={onClose}
                className="absolute inset-0 bg-ink-strong/50 backdrop-blur-sm"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="project-modal-title"
                className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-elevated"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-canvas flex items-center justify-center border border-border shrink-0">
                            {project.area ? getAreaIcon(project.area.id, MOCK_CATALOGS.areas, getAreaColor(project.area.id, MOCK_CATALOGS.areas)) : <Briefcase className="w-6 h-6 text-primary" />}
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${project.area ? getAreaColor(project.area.id, MOCK_CATALOGS.areas) : 'text-primary'}`}>
                            {project.area?.nombre ?? '—'}
                        </span>
                    </div>
                    <button
                        type="button"
                        aria-label={t('close')}
                        onClick={onClose}
                        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-ink-muted hover:bg-surface-sunken transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <h2 id="project-modal-title" className="font-heading text-2xl font-bold text-ink-strong mt-4 leading-tight">
                    {project.titulo}
                </h2>

                {project.empresa && (
                    <p className="text-xs text-ink-muted mt-1">{project.empresa.nombre_comercial}</p>
                )}

                <p className="text-ink-muted text-sm leading-relaxed mt-4">{project.descripcion}</p>

                <div className="grid grid-cols-2 gap-4 mt-5">
                    <div>
                        <p className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider mb-1">
                            {t('business_area_label')}
                        </p>
                        <p className="text-sm font-semibold text-ink-strong">{project.area?.nombre ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider mb-1">{t('duration')}</p>
                        <p className="text-sm font-semibold text-ink-strong">{project.plazo_dias} días</p>
                    </div>
                </div>

                {project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5">
                        {project.skills.flatMap((s) => s.skill ? [s.skill] : []).map((skill) => (
                            <span
                                key={skill.id}
                                className="bg-ink-strong text-surface text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                            >
                                {skill.nombre}
                            </span>
                        ))}
                    </div>
                )}

                {project.usa_ia && (
                    <div className="rounded-xl border border-secondary/15 bg-secondary/5 p-4 mt-5">
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1.5">
                            {t('ai_usage_label')}
                        </p>
                        <p className="text-xs text-ink-muted leading-relaxed">{t('ai_usage_label')}</p>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <Button variant="default" className="rounded-full px-6" onClick={onClose}>
                        {t('close')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function MarketPlace({ initialProjects, catalogs, role = 'student', appliedProjectIds = [] }: Props) {
    const t = useTranslations('marketplace_page');
    const locale = useLocale();

    const projects = initialProjects.length > 0 ? initialProjects : MOCK_PROJECTS;
    const activeCatalogs = catalogs.areas.length > 0 ? catalogs : MOCK_CATALOGS;

    const [searchQuery, setSearchQuery] = useState('');
    const [activeArea, setActiveArea] = useState<string | null>(null);
    const [activeDuration, setActiveDuration] = useState<string | null>(null);
    const [activeSkill, setActiveSkill] = useState<string | null>(null);
    const [showAiOnly, setShowAiOnly] = useState(false);
    const [sortOrder, setSortOrder] = useState<SortOrder>('sort_recent_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [savedProjectIds, setSavedProjectIds] = useState<ReadonlySet<string>>(new Set());
    const [sheetProject, setSheetProject] = useState<ApiProject | null>(null);
    const [selectedProject, setSelectedProject] = useState<ApiProject | null>(null);

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

    const sortOptions: FilterOption[] = [
        { value: 'sort_recent_desc', label: t('sort_match_desc') },
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
            if (showAiOnly && !project.usa_ia) return false;
            return true;
        });

        if (sortOrder === 'sort_duration_asc') {
            return [...matching].sort((a, b) => a.plazo_dias - b.plazo_dias);
        }
        return [...matching].sort((a, b) =>
            (b.fecha_publicacion ?? '').localeCompare(a.fecha_publicacion ?? ''),
        );
    }, [projects, searchQuery, activeArea, activeDuration, activeSkill, showAiOnly, sortOrder]);

    const totalResults = filteredProjects.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pageProjects = filteredProjects.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const hasActiveFilters =
        searchQuery !== '' ||
        activeArea !== null ||
        activeDuration !== null ||
        activeSkill !== null ||
        showAiOnly;

    function resetToFirstPage() {
        setCurrentPage(1);
    }

    function clearAllFilters() {
        setSearchQuery('');
        setActiveArea(null);
        setActiveDuration(null);
        setActiveSkill(null);
        setShowAiOnly(false);
        resetToFirstPage();
    }

    function toggleSaved(projectId: string) {
        setSavedProjectIds((current) => {
            const next = new Set(current);
            if (next.has(projectId)) {
                next.delete(projectId);
            } else {
                next.add(projectId);
            }
            return next;
        });
    }

    return (
        <>
        <ProjectDetailSheet
            project={sheetProject}
            isOpen={!!sheetProject}
            onClose={() => setSheetProject(null)}
            role={role ?? null}
            showApplyForm={role === 'student'}
            alreadyApplied={sheetProject ? appliedProjectIds.includes(sheetProject.id) : false}
            isProjectExpired={sheetProject ? isExpired(sheetProject.fecha_cierre) : false}
        />
        <div className="bg-marketplace-sky relative overflow-hidden min-h-screen text-ink font-body pb-20">
            <MarketplaceHeroBackdrop />

            {/* Hero */}
            <section className="relative z-10 px-6 pt-16 pb-40 md:pt-24 md:pb-52">
                <div className="relative z-10 mx-auto max-w-3xl text-center">
                    <h1 className="font-heading text-6xl md:text-7xl font-bold tracking-tight text-white">
                        {t('hero_title')}<span className="text-primary" aria-hidden="true">.</span>
                    </h1>
                    <p className="mt-5 text-base md:text-lg text-white/80 leading-relaxed">
                        {t('hero_subtitle')}
                    </p>
                </div>
            </section>

            {/* Search + filters */}
            <div className="relative z-20 max-w-5xl mx-auto px-6 -mt-16 md:-mt-20">
                <div className="flex flex-col gap-4 rounded-full border border-white/20 bg-secondary/40 px-3 py-3 shadow-elevated backdrop-blur-md md:flex-row md:items-center md:gap-2 md:py-2 md:pl-6 md:pr-2">
                    <div className="flex flex-1 items-center gap-3">
                        <Search className="w-4 h-4 shrink-0 text-white/70" aria-hidden="true" />
                        <label htmlFor="marketplace-search" className="sr-only">{t('search_label')}</label>
                        <input
                            id="marketplace-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); resetToFirstPage(); }}
                            placeholder={t('search_placeholder')}
                            className="w-full bg-transparent text-sm text-white placeholder:text-white/55 focus:outline-none"
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
                                showAiOnly ? 'bg-white/25 text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'
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

            {/* Results */}
            <div className="max-w-6xl mx-auto px-6 mt-14 relative z-10">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <p className="text-base font-bold text-ink-strong">
                        {t('results_count', { count: totalResults })}
                    </p>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearAllFilters}
                            className="text-xs font-semibold text-primary hover:underline"
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
                            const colorClass = project.area
                                ? getAreaColor(project.area.id, activeCatalogs.areas)
                                : 'text-primary';
                            const icon = project.area
                                ? getAreaIcon(project.area.id, activeCatalogs.areas, colorClass)
                                : <Briefcase className="w-6 h-6 text-primary" />;
                            const skills = project.skills.flatMap((s) => (s.skill ? [s.skill] : []));

                            return (
                                <div
                                    key={project.id}
                                    className="bg-surface rounded-2xl p-6 border border-border flex flex-col hover:shadow-soft hover:border-border-strong transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]"
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-canvas flex items-center justify-center border border-border shrink-0">
                                                {icon}
                                            </div>
                                            <span className={`text-[11px] font-bold uppercase tracking-wider ${colorClass}`}>
                                                {project.area?.nombre ?? '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {expired && (
                                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-magenta/10 text-magenta">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {t('badge_expired')}
                                                </span>
                                            )}
                                            {hasApplied && !expired && (
                                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-accent/10 text-accent">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    {t('badge_applied')}
                                                </span>
                                            )}
                                            {project.usa_ia && !hasApplied && !expired && (
                                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-accent/10 text-accent">
                                                    <Zap className="w-3.5 h-3.5" />
                                                    IA
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <h3 className="font-heading text-xl font-bold text-ink-strong mb-1 leading-tight">
                                        {project.titulo}
                                    </h3>
                                    {project.empresa && (
                                        <p className="text-xs text-ink-muted mb-2">
                                            {project.empresa.nombre_comercial}
                                        </p>
                                    )}
                                    <p className="text-ink-muted text-sm leading-relaxed mb-5 line-clamp-3">
                                        {project.descripcion}
                                    </p>

                                    {/* Meta */}
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <p className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider mb-1">
                                                {t('business_area_label')}
                                            </p>
                                            <p className="text-sm font-semibold text-ink-strong">
                                                {project.area?.nombre ?? '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider mb-1">
                                                {t('duration')}
                                            </p>
                                            <p className="text-sm font-semibold text-ink-strong">
                                                {project.plazo_dias} días
                                            </p>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    {skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-5">
                                            {skills.slice(0, 4).map((skill) => (
                                                <span
                                                    key={skill.id}
                                                    className="bg-ink-strong text-surface text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                                                >
                                                    {skill.nombre}
                                                </span>
                                            ))}
                                            {skills.length > 4 && (
                                                <span className="bg-ink-strong text-surface text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                    +{skills.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="mt-auto flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSheetProject(project)}
                                            className={`flex-1 rounded-full px-5 py-2.5 text-sm font-semibold text-center transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
                                                expired
                                                    ? 'bg-surface-sunken text-ink-muted cursor-default'
                                                    : 'bg-primary text-primary-foreground hover:bg-secondary'
                                            }`}
                                        >
                                            {expired ? t('badge_expired') : hasApplied ? t('view_my_offer') : t('view_project')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedProject(project)}
                                            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink-muted hover:border-primary/30 hover:text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]"
                                            aria-label={t('view_project')}
                                        >
                                            <Sparkles className="w-4 h-4" aria-hidden="true" />
                                        </button>
                                        <Link
                                            href={`/${locale}/marketplace/${project.id}`}
                                            aria-label="Abrir página completa"
                                            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink-muted hover:border-primary/30 hover:text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]"
                                        >
                                            <ExternalLink className="w-4 h-4" aria-hidden="true" />
                                        </Link>
                                        <button
                                            type="button"
                                            aria-label={isSaved ? t('saved_project') : t('save_project')}
                                            aria-pressed={isSaved}
                                            onClick={() => toggleSaved(project.id)}
                                            className={`size-10 shrink-0 flex items-center justify-center rounded-full transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
                                                isSaved
                                                    ? 'bg-highlight text-highlight-foreground'
                                                    : 'bg-ink-strong text-surface hover:bg-secondary'
                                            }`}
                                        >
                                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
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
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-ink-muted bg-surface hover:bg-surface-sunken transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] disabled:opacity-40 disabled:pointer-events-none"
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
                                        ? 'bg-primary text-primary-foreground'
                                        : 'border border-border text-ink-muted bg-surface hover:bg-surface-sunken'
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
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-ink-muted bg-surface hover:bg-surface-sunken transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] disabled:opacity-40 disabled:pointer-events-none"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </nav>
                )}
            </div>

            {selectedProject && (
                <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
            )}
        </div>
        </>
    );
}
