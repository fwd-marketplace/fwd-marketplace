'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
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
    Sparkles,
    Search,
    Bookmark,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';
import { MarketplaceHeroBackdrop } from '@/components/marketplace/MarketplaceHeroBackdrop';
import { Button } from '@/components/ui/button';

/** How many project cards are shown per page. */
const PAGE_SIZE = 6;

/** Day ranges (inclusive) backing each duration filter bucket. */
const DURATION_RANGES = {
    short: { min: 0, max: 30 },
    medium: { min: 31, max: 60 },
    long: { min: 61, max: Number.POSITIVE_INFINITY },
} as const;

type DurationBucket = keyof typeof DURATION_RANGES;
type SortOrder = 'sort_match_desc' | 'sort_match_asc' | 'sort_duration_asc';

interface MarketplaceProject {
    id: number;
    category: string;
    categoryClass: string;
    title: string;
    description: string;
    icon: ReactNode;
    businessArea: string;
    duration: string;
    durationDays: number;
    tags: string[];
    aiUsage: string | null;
    usesAi: boolean;
    match: number;
}

interface FilterOption {
    value: string;
    label: string;
}

/**
 * Mock data simulating projects served by the BackEnd. No backend call is wired here;
 * once the API exists this list comes from `lib/api/`.
 */
const MOCK_PROJECTS: readonly MarketplaceProject[] = [
    {
        id: 1,
        category: 'FINTECH',
        categoryClass: 'text-primary',
        title: 'Sistema de Gestión de Créditos',
        description: 'Rediseño integral de la plataforma B2B para optimizar flujos de aprobación y visualización de KPIs financieros en tiempo real.',
        icon: <LayoutGrid className="w-6 h-6 text-primary" />,
        businessArea: 'Finanzas Digitales',
        duration: '45 días est.',
        durationDays: 45,
        tags: ['PYTHON', 'REACT', 'AWS'],
        aiUsage: 'Modelos de scoring predictivo integrados para la automatización de decisiones de riesgo.',
        usesAi: true,
        match: 92,
    },
    {
        id: 2,
        category: 'SALUD',
        categoryClass: 'text-magenta',
        title: 'Telemedicina Pro 2.0',
        description: 'Plataforma de atención remota con diagnóstico asistido y gestión segura de expedientes médicos electrónicos.',
        icon: <Cloud className="w-6 h-6 text-magenta" />,
        businessArea: 'HealthTech',
        duration: '60 días est.',
        durationDays: 60,
        tags: ['NODE', 'POSTGRES', 'NLP'],
        aiUsage: 'NLP para la transcripción automática de consultas y extracción de diagnósticos sugeridos.',
        usesAi: true,
        match: 85,
    },
    {
        id: 3,
        category: 'E-COMMERCE',
        categoryClass: 'text-accent',
        title: 'Smart Logistics App',
        description: 'Aplicación nativa para la optimización de rutas de última milla y seguimiento satelital de flotas comerciales.',
        icon: <Smartphone className="w-6 h-6 text-accent" />,
        businessArea: 'Logística',
        duration: '30 días est.',
        durationDays: 30,
        tags: ['REACT NATIVE', 'GO', 'KAFKA'],
        aiUsage: 'Algoritmos de aprendizaje reforzado para el cálculo dinámico de rutas en tiempo real.',
        usesAi: true,
        match: 78,
    },
    {
        id: 4,
        category: 'FINTECH',
        categoryClass: 'text-primary',
        title: 'Panel de Inversiones Retail',
        description: 'Tablero interactivo para inversores minoristas con gráficos en vivo, alertas configurables y exportación de portafolios.',
        icon: <LineChart className="w-6 h-6 text-warning" />,
        businessArea: 'Inversiones',
        duration: '90 días est.',
        durationDays: 90,
        tags: ['REACT', 'TYPESCRIPT', 'D3'],
        aiUsage: null,
        usesAi: false,
        match: 73,
    },
    {
        id: 5,
        category: 'EDUTECH',
        categoryClass: 'text-secondary',
        title: 'Plataforma de Cursos en Vivo',
        description: 'Aulas virtuales con video en tiempo real, pizarra colaborativa y seguimiento de progreso por estudiante.',
        icon: <GraduationCap className="w-6 h-6 text-secondary" />,
        businessArea: 'Educación',
        duration: '25 días est.',
        durationDays: 25,
        tags: ['VUE', 'WEBRTC', 'NODE'],
        aiUsage: null,
        usesAi: false,
        match: 88,
    },
    {
        id: 6,
        category: 'SALUD',
        categoryClass: 'text-magenta',
        title: 'App de Seguimiento Nutricional',
        description: 'Aplicación móvil que registra hábitos alimenticios y sugiere planes personalizados según objetivos de salud.',
        icon: <HeartPulse className="w-6 h-6 text-magenta" />,
        businessArea: 'Bienestar',
        duration: '50 días est.',
        durationDays: 50,
        tags: ['FLUTTER', 'FIREBASE'],
        aiUsage: 'Recomendaciones de planes alimenticios generadas a partir del historial del usuario.',
        usesAi: true,
        match: 69,
    },
    {
        id: 7,
        category: 'LOGÍSTICA',
        categoryClass: 'text-warning',
        title: 'Optimizador de Rutas B2B',
        description: 'Motor de planificación que reduce costos de distribución combinando ventanas horarias y capacidad de flota.',
        icon: <Truck className="w-6 h-6 text-warning" />,
        businessArea: 'Distribución',
        duration: '70 días est.',
        durationDays: 70,
        tags: ['PYTHON', 'FASTAPI', 'POSTGRES'],
        aiUsage: 'Optimización combinatoria asistida por modelos de predicción de demanda.',
        usesAi: true,
        match: 81,
    },
    {
        id: 8,
        category: 'MARKETING',
        categoryClass: 'text-accent',
        title: 'Dashboard de Campañas',
        description: 'Panel unificado para medir el rendimiento de campañas multicanal con reportes automáticos y exportables.',
        icon: <Megaphone className="w-6 h-6 text-accent" />,
        businessArea: 'Growth',
        duration: '20 días est.',
        durationDays: 20,
        tags: ['NEXT', 'TAILWIND', 'NODE'],
        aiUsage: null,
        usesAi: false,
        match: 64,
    },
    {
        id: 9,
        category: 'E-COMMERCE',
        categoryClass: 'text-accent',
        title: 'Rediseño Checkout Mobile',
        description: 'Optimización del flujo de pago en mobile para reducir el abandono y soportar múltiples métodos de pago.',
        icon: <ShoppingCart className="w-6 h-6 text-primary" />,
        businessArea: 'Retail',
        duration: '40 días est.',
        durationDays: 40,
        tags: ['REACT NATIVE', 'STRIPE'],
        aiUsage: null,
        usesAi: false,
        match: 76,
    },
];

/** Distinct business categories, derived once from the static dataset. */
const AREA_OPTIONS: readonly FilterOption[] = Array.from(
    new Set(MOCK_PROJECTS.map((project) => project.category)),
).map((category) => ({ value: category, label: category }));

/** Distinct skill tags, derived once from the static dataset. */
const SKILL_OPTIONS: readonly FilterOption[] = Array.from(
    new Set(MOCK_PROJECTS.flatMap((project) => project.tags)),
)
    .sort((first, second) => first.localeCompare(second))
    .map((tag) => ({ value: tag, label: tag }));

function isWithinDurationBucket(durationDays: number, bucket: DurationBucket): boolean {
    const range = DURATION_RANGES[bucket];
    return durationDays >= range.min && durationDays <= range.max;
}

function matchesSearchQuery(project: MarketplaceProject, query: string): boolean {
    const normalized = query.trim().toLowerCase();
    if (normalized === '') return true;
    const haystack = [project.title, project.description, project.businessArea, project.category, ...project.tags]
        .join(' ')
        .toLowerCase();
    return haystack.includes(normalized);
}

function sortProjects(projects: readonly MarketplaceProject[], order: SortOrder): MarketplaceProject[] {
    const sorted = [...projects];
    switch (order) {
        case 'sort_match_asc':
            return sorted.sort((first, second) => first.match - second.match);
        case 'sort_duration_asc':
            return sorted.sort((first, second) => first.durationDays - second.durationDays);
        case 'sort_match_desc':
        default:
            return sorted.sort((first, second) => second.match - first.match);
    }
}

function getMatchColor(match: number): string {
    if (match >= 85) return 'bg-accent/10 text-accent';
    if (match >= 70) return 'bg-primary/10 text-primary';
    return 'bg-magenta/10 text-magenta';
}

/** Pill-shaped dropdown used for the Area / Duration / Skills / Sort filters in the hero bar. */
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
    const selected = options.find((option) => option.value === value) ?? null;

    return (
        <div className="relative">
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((open) => !open)}
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
                        className="absolute left-0 z-40 mt-2 min-w-44 overflow-hidden rounded-2xl border border-border bg-surface p-1 shadow-elevated"
                    >
                        {allLabel && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(null);
                                    setIsOpen(false);
                                }}
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
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
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

/** Modal showing the full detail of a project when "Ver proyecto" is pressed. */
function ProjectDetailModal({ project, onClose }: { project: MarketplaceProject; onClose: () => void }) {
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
                            {project.icon}
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${project.categoryClass}`}>
                            {project.category}
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
                    {project.title}
                </h2>
                <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide ${getMatchColor(project.match)}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    {project.match}% {t('match_suffix')}
                </div>

                <p className="text-ink-muted text-sm leading-relaxed mt-4">{project.description}</p>

                <div className="grid grid-cols-2 gap-4 mt-5">
                    <div>
                        <p className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider mb-1">
                            {t('business_area_label')}
                        </p>
                        <p className="text-sm font-semibold text-ink-strong">{project.businessArea}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider mb-1">{t('duration')}</p>
                        <p className="text-sm font-semibold text-ink-strong">{project.duration}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
                    {project.tags.map((tag) => (
                        <span
                            key={tag}
                            className="bg-ink-strong text-surface text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {project.usesAi && project.aiUsage && (
                    <div className="rounded-xl border border-secondary/15 bg-secondary/5 p-4 mt-5">
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1.5">
                            {t('ai_usage_label')}
                        </p>
                        <p className="text-xs text-ink-muted leading-relaxed">{project.aiUsage}</p>
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

export default function MarketPlace() {
    const t = useTranslations('marketplace_page');

    const [searchQuery, setSearchQuery] = useState('');
    const [activeArea, setActiveArea] = useState<string | null>(null);
    const [activeDuration, setActiveDuration] = useState<string | null>(null);
    const [activeSkill, setActiveSkill] = useState<string | null>(null);
    const [showAiOnly, setShowAiOnly] = useState(false);
    const [sortOrder, setSortOrder] = useState<SortOrder>('sort_match_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [savedProjectIds, setSavedProjectIds] = useState<ReadonlySet<number>>(new Set());
    const [selectedProject, setSelectedProject] = useState<MarketplaceProject | null>(null);

    const durationOptions: readonly FilterOption[] = [
        { value: 'short', label: t('duration_short') },
        { value: 'medium', label: t('duration_medium') },
        { value: 'long', label: t('duration_long') },
    ];

    const sortOptions: readonly FilterOption[] = [
        { value: 'sort_match_desc', label: t('sort_match_desc') },
        { value: 'sort_match_asc', label: t('sort_match_asc') },
        { value: 'sort_duration_asc', label: t('sort_duration_asc') },
    ];

    const filteredProjects = useMemo(() => {
        const matching = MOCK_PROJECTS.filter((project) => {
            if (!matchesSearchQuery(project, searchQuery)) return false;
            if (activeArea && project.category !== activeArea) return false;
            if (activeDuration && !isWithinDurationBucket(project.durationDays, activeDuration as DurationBucket)) return false;
            if (activeSkill && !project.tags.includes(activeSkill)) return false;
            if (showAiOnly && !project.usesAi) return false;
            return true;
        });
        return sortProjects(matching, sortOrder);
    }, [searchQuery, activeArea, activeDuration, activeSkill, showAiOnly, sortOrder]);

    const totalResults = filteredProjects.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pageProjects = filteredProjects.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const hasActiveFilters = searchQuery !== '' || activeArea !== null || activeDuration !== null || activeSkill !== null || showAiOnly;

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

    function toggleSavedProject(projectId: number) {
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
        <div className="bg-marketplace-sky relative overflow-hidden min-h-screen text-ink font-body pb-20">

            {/* Sky backdrop spans the whole page (gradient + geometry + stars) */}
            <MarketplaceHeroBackdrop />

            {/* ── Hero Section (Brand Expresivo) ── */}
            <section className="relative z-10 px-6 pt-16 pb-40 md:pt-24 md:pb-52">

                {/* Title + subtitle */}
                <div className="relative z-10 mx-auto max-w-3xl text-center">
                    <h1 className="font-heading text-6xl md:text-7xl font-bold tracking-tight text-white">
                        {t('hero_title')}<span className="text-primary" aria-hidden="true">.</span>
                    </h1>
                    <p className="mt-5 text-base md:text-lg text-white/80 leading-relaxed">
                        {t('hero_subtitle')}
                    </p>
                </div>
            </section>

            {/* ── Search + filters bar (overlaps hero) ── */}
            <div className="relative z-20 max-w-5xl mx-auto px-6 -mt-16 md:-mt-20">
                <div className="flex flex-col gap-4 rounded-full border border-white/20 bg-secondary/40 px-3 py-3 shadow-elevated backdrop-blur-md md:flex-row md:items-center md:gap-2 md:py-2 md:pl-6 md:pr-2">
                    <div className="flex flex-1 items-center gap-3">
                        <Search className="w-4 h-4 shrink-0 text-white/70" aria-hidden="true" />
                        <label htmlFor="marketplace-search" className="sr-only">{t('search_label')}</label>
                        <input
                            id="marketplace-search"
                            type="text"
                            value={searchQuery}
                            onChange={(event) => {
                                setSearchQuery(event.target.value);
                                resetToFirstPage();
                            }}
                            placeholder={t('search_placeholder')}
                            className="w-full bg-transparent text-sm text-white placeholder:text-white/55 focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <FilterDropdown
                            triggerLabel={t('filter_area')}
                            value={activeArea}
                            options={AREA_OPTIONS}
                            allLabel={t('filter_all')}
                            onChange={(value) => {
                                setActiveArea(value);
                                resetToFirstPage();
                            }}
                        />
                        <FilterDropdown
                            triggerLabel={t('filter_duration')}
                            value={activeDuration}
                            options={durationOptions}
                            allLabel={t('filter_all')}
                            onChange={(value) => {
                                setActiveDuration(value);
                                resetToFirstPage();
                            }}
                        />
                        <FilterDropdown
                            triggerLabel={t('filter_skills')}
                            value={activeSkill}
                            options={SKILL_OPTIONS}
                            allLabel={t('filter_all')}
                            onChange={(value) => {
                                setActiveSkill(value);
                                resetToFirstPage();
                            }}
                        />
                        <button
                            type="button"
                            aria-pressed={showAiOnly}
                            onClick={() => {
                                setShowAiOnly((current) => !current);
                                resetToFirstPage();
                            }}
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
                            onChange={(value) => {
                                if (value) setSortOrder(value as SortOrder);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
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
                            return (
                                <div key={project.id} className="bg-surface rounded-2xl p-6 border border-border flex flex-col hover:shadow-soft hover:border-border-strong transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]">

                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-canvas flex items-center justify-center border border-border shrink-0">
                                                {project.icon}
                                            </div>
                                            <span className={`text-[11px] font-bold uppercase tracking-wider ${project.categoryClass}`}>
                                                {project.category}
                                            </span>
                                        </div>
                                        <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide ${getMatchColor(project.match)}`}>
                                            <Sparkles className="w-3.5 h-3.5" />
                                            {project.match}% {t('match_suffix')}
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <h3 className="font-heading text-xl font-bold text-ink-strong mb-2 leading-tight">{project.title}</h3>
                                    <p className="text-ink-muted text-sm leading-relaxed mb-5">
                                        {project.description}
                                    </p>

                                    {/* Meta row */}
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <p className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider mb-1">
                                                {t('business_area_label')}
                                            </p>
                                            <p className="text-sm font-semibold text-ink-strong">{project.businessArea}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider mb-1">
                                                {t('duration')}
                                            </p>
                                            <p className="text-sm font-semibold text-ink-strong">{project.duration}</p>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="bg-ink-strong text-surface text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* AI usage */}
                                    {project.usesAi && project.aiUsage && (
                                        <div className="rounded-xl border border-secondary/15 bg-secondary/5 p-4 mb-6">
                                            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1.5">
                                                {t('ai_usage_label')}
                                            </p>
                                            <p className="text-xs text-ink-muted leading-relaxed">
                                                {project.aiUsage}
                                            </p>
                                        </div>
                                    )}

                                    {/* Card Footer */}
                                    <div className="mt-auto flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedProject(project)}
                                            className="flex-1 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-secondary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]"
                                        >
                                            {t('view_project')}
                                        </button>
                                        <button
                                            type="button"
                                            aria-label={isSaved ? t('saved_project') : t('save_project')}
                                            aria-pressed={isSaved}
                                            onClick={() => toggleSavedProject(project.id)}
                                            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
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
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-ink-muted bg-surface hover:bg-surface-sunken transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] disabled:opacity-40 disabled:pointer-events-none"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
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
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
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
    );
}
