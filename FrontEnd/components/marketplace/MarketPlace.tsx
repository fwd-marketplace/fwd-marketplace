'use client';

import { useTranslations } from 'next-intl';
import { Search, X, ChevronLeft, ChevronRight, ChevronDown, LayoutGrid, Cloud, Cpu, Smartphone } from 'lucide-react';
import React from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Sparkles } from 'lucide-react';
function getMatchColor(match: number) {
    if (match >= 90) return 'text-success bg-success/15'; // 90%+
    if (match >= 70) return 'text-accent bg-accent/15'; // Good match
    if (match >= 50) return 'text-warning bg-warning/15'; // 50-69%
    return 'text-magenta bg-magenta/15'; // <50%
}

// Mock data (since no backend is requested)
const MOCK_PROJECTS = [
    {
        id: 1,
        title: 'Rediseño Sistema de Gestión Fintech',
        description: 'Buscamos un Product Designer con experiencia en sistemas financieros complejos para iterar nuestra plataforma B2B de créditos escalables.',
        icon: <LayoutGrid className="w-6 h-6 text-primary" />,
        badgeType: 'urgent',
        tags: ['FIGMA', 'STORYBOOK', 'DESIGN SYSTEMS'],
        footerLabel: 'budget',
        footerValue: '$4,500 - $6,000 USD',
        match: 92,
    },
    {
        id: 2,
        title: 'Arquitectura de Microservicios Cloud',
        description: 'Implementación de infraestructura resiliente utilizando Kubernetes y AWS para una plataforma e-commerce de alto tráfico internacional.',
        icon: <Cloud className="w-6 h-6 text-secondary" />,
        badgeType: 'full_time',
        tags: ['GO', 'AWS', 'DOCKER'],
        footerLabel: 'duration',
        footerValue: '6 meses est.',
        match: 78,
    },
    {
        id: 3,
        title: 'Modelado de ML para Predicción de Churn',
        description: 'Desarrollo de modelos predictivos basados en comportamiento de usuario para optimizar la retención en SaaS de salud mental.',
        icon: <Cpu className="w-6 h-6 text-warning" />,
        badgeType: 'project',
        tags: ['PYTHON', 'PYTORCH', 'SQL'],
        footerLabel: 'experience',
        footerValue: 'Senior +5 años',
        match: 56,
    },
    {
        id: 4,
        title: 'Desarrollo Mobile App React Native',
        description: 'Ampliación de funcionalidades core y optimización de performance para aplicación nativa de logística en tiempo real.',
        icon: <Smartphone className="w-6 h-6 text-primary" />,
        badgeType: 'part_time',
        tags: ['REACT NATIVE', 'TYPESCRIPT'],
        footerLabel: 'hourly_rate',
        footerValue: '$45 - $65 USD',
        match: 70,
    }
];

export default function MarketPlace() {
    const t = useTranslations('marketplace_page');

    return (
        <div className="min-h-screen bg-canvas text-ink font-body pb-20">
            {/* Container */}
            <div className="max-w-6xl mx-auto px-6 pt-12">
                {/* Header */}
                <div className="mb-10">
                    <PageTitle
                        eyebrow={t('eyebrow')}
                        title={t('title')}
                    />
                </div>

                {/* Filters Section */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                    <div className="flex-1 w-full max-w-sm">
                        <label className="block text-xs font-semibold text-ink-muted mb-1.5">{t('search_label')}</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                className="w-full pl-9 pr-4 py-2.5 bg-surface-sunken border border-border rounded-lg text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-[160ms]"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-64">
                        <label className="block text-xs font-semibold text-ink-muted mb-1.5">{t('specialty_label')}</label>
                        <div className="relative">
                            <select className="w-full pl-4 pr-10 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-[160ms]">
                                <option>{t('specialty_all')}</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Active Filters */}
                <div className="flex items-center flex-wrap gap-3 mb-10">
                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                        {t('active_filters')}
                    </span>
                    <div className="flex items-center gap-1 bg-surface border border-border rounded-md px-2.5 py-1 text-xs text-ink-muted hover:bg-surface-sunken transition-colors cursor-pointer">
                        {t('filter_remote')} <X className="w-3 h-3 ml-1" />
                    </div>
                    <div className="flex items-center gap-1 bg-surface border border-border rounded-md px-2.5 py-1 text-xs text-ink-muted hover:bg-surface-sunken transition-colors cursor-pointer">
                        {t('filter_senior')} <X className="w-3 h-3 ml-1" />
                    </div>
                    <button className="text-xs text-primary font-semibold hover:underline ml-2">
                        {t('clear_all')}
                    </button>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MOCK_PROJECTS.map((project) => (
                        <div key={project.id} className="bg-surface rounded-2xl p-6 md:p-8 border border-border flex flex-col hover:shadow-soft hover:border-border-strong transition-all duration-[220ms]">

                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-5">
                                <div className="w-14 h-14 rounded-2xl bg-canvas flex items-center justify-center border border-border-strong/10 shadow-sm shrink-0">
                                    {project.icon}
                                </div>
                                <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold tracking-wide ${getMatchColor(project.match)}`}>
                                    <Sparkles className="w-4 h-4" />
                                    {project.match}% {t('match_suffix')}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="flex-1">
                                <h3 className="font-heading text-xl font-bold text-ink-strong mb-3 leading-tight">{project.title}</h3>
                                <p className="text-ink-muted text-sm leading-relaxed mb-6">
                                    {project.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {project.tags.map(tag => (
                                        <span key={tag} className="bg-surface-sunken text-ink-muted text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-border w-full mb-5" />

                            {/* Card Footer */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider mb-1">
                                        {t(project.footerLabel)}
                                    </p>
                                    <p className="text-sm font-semibold text-ink-strong">
                                        {project.footerValue}
                                    </p>
                                </div>
                                <button className="rounded-full border border-primary text-primary px-5 py-1.5 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors duration-[160ms]">
                                    {t('view_project')}
                                </button>
                            </div>

                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-1.5 mt-16 font-body">
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-ink-muted bg-surface hover:bg-surface-sunken transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
                        1
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-ink-muted bg-surface hover:bg-surface-sunken transition-colors text-sm font-medium">
                        2
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-ink-muted bg-surface hover:bg-surface-sunken transition-colors text-sm font-medium">
                        3
                    </button>
                    <span className="w-9 h-9 flex items-center justify-center text-ink-subtle text-sm">
                        ...
                    </span>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-ink-muted bg-surface hover:bg-surface-sunken transition-colors text-sm font-medium">
                        12
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-ink-muted bg-surface hover:bg-surface-sunken transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    );
}
