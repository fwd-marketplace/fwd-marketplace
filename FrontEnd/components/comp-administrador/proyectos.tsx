'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Search,
  Check,
  Pause,
  Play,
  Trash2,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ProjectStatus = 'moderation' | 'active' | 'paused' | 'closed';

interface Project {
  id: string;
  title: string;
  company: string;
  budget: number;
  stack: string[];
  applicationsCount: number;
  status: ProjectStatus;
  publishedAt: string;
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: '201',
    title: 'Portal E-commerce Pymes',
    company: 'Acme Corporación',
    budget: 1200,
    stack: ['React', 'Node.js'],
    applicationsCount: 8,
    status: 'moderation',
    publishedAt: '2026-06-10',
  },
  {
    id: '202',
    title: 'Dashboard de Analítica',
    company: 'Innovatech S.A.',
    budget: 900,
    stack: ['Vue', 'Python'],
    applicationsCount: 5,
    status: 'active',
    publishedAt: '2026-06-08',
  },
  {
    id: '203',
    title: 'App Móvil Inventario',
    company: 'TechFlow Systems',
    budget: 1500,
    stack: ['React Native'],
    applicationsCount: 12,
    status: 'paused',
    publishedAt: '2026-05-28',
  },
  {
    id: '204',
    title: 'Sistema de Facturación',
    company: 'Contaplus S.A.',
    budget: 700,
    stack: ['Next.js', 'PostgreSQL'],
    applicationsCount: 3,
    status: 'moderation',
    publishedAt: '2026-06-12',
  },
  {
    id: '205',
    title: 'Landing Corporativa',
    company: 'Pixel Studio',
    budget: 400,
    stack: ['HTML', 'CSS', 'JS'],
    applicationsCount: 7,
    status: 'closed',
    publishedAt: '2026-05-15',
  },
];

const STATUS_ALL = 'all' as const;
type FilterStatus = ProjectStatus | typeof STATUS_ALL;

function statusBadgeClass(status: ProjectStatus): string {
  switch (status) {
    case 'active':
      return 'bg-accent/15 text-accent';
    case 'paused':
      return 'bg-ink-muted/15 text-ink-muted';
    case 'moderation':
      return 'bg-warning/15 text-warning';
    case 'closed':
      return 'bg-secondary/10 text-secondary';
  }
}

export function Proyectos() {
  const t = useTranslations('admin');

  const [projects, setProjects] = React.useState<Project[]>(INITIAL_PROJECTS);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<FilterStatus>(STATUS_ALL);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  const handleApprove = (id: string) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'active' as ProjectStatus } : p))
    );
  };

  const handleTogglePause = (id: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        return { ...p, status: p.status === 'active' ? 'paused' : 'active' };
      })
    );
  };

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setConfirmDeleteId(null);
  };

  const filtered = projects.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === STATUS_ALL || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const projectToDelete = projects.find(p => p.id === confirmDeleteId);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-ink-subtle" />
          <input
            id="projects-search"
            type="text"
            placeholder={t('projects.search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-surface border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="relative">
          <select
            id="projects-status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as FilterStatus)}
            className="appearance-none pl-3 pr-8 py-2 bg-surface border border-border rounded-xl text-sm text-ink focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value={STATUS_ALL}>{t('projects.filter_status')}</option>
            <option value="moderation">{t('projects.status_moderation')}</option>
            <option value="active">{t('projects.status_active')}</option>
            <option value="paused">{t('projects.status_paused')}</option>
            <option value="closed">{t('projects.status_closed')}</option>
          </select>
          <Filter className="absolute right-3 top-3 size-3 text-ink-subtle pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-surface-sunken border-b border-border">
                <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">
                  {t('projects.col_project')}
                </th>
                <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">
                  {t('projects.company')}
                </th>
                <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">
                  {t('projects.budget')}
                </th>
                <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">
                  {t('projects.col_applications')}
                </th>
                <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">
                  {t('projects.status')}
                </th>
                <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs text-right">
                  {t('applications.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-ink-muted">
                    {t('projects.empty')}
                  </td>
                </tr>
              ) : (
                filtered.map(proj => (
                  <tr
                    key={proj.id}
                    className="hover:bg-surface-sunken/40 transition-colors duration-[var(--duration-fast)]"
                  >
                    {/* Proyecto */}
                    <td className="p-4">
                      <p className="font-semibold text-ink-strong leading-snug">{proj.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {proj.stack.map(tech => (
                          <span
                            key={tech}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/8 text-primary uppercase tracking-wider"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Empresa */}
                    <td className="p-4 text-ink-muted">{proj.company}</td>

                    {/* Presupuesto */}
                    <td className="p-4 font-mono font-bold text-primary text-sm">
                      ${proj.budget.toLocaleString()} USD
                    </td>

                    {/* Postulaciones */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-bold text-ink-strong">
                        {proj.applicationsCount}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="p-4">
                      <Badge
                        className={cn('border-none font-semibold', statusBadgeClass(proj.status))}
                      >
                        {t(`projects.status_${proj.status}`)}
                      </Badge>
                    </td>

                    {/* Acciones */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {proj.status === 'moderation' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(proj.id)}
                            className="bg-accent hover:bg-accent/90 text-white rounded-full text-xs font-bold px-3 h-7 gap-1"
                          >
                            <Check className="size-3" />
                            {t('projects.approve')}
                          </Button>
                        )}
                        {(proj.status === 'active' || proj.status === 'paused') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTogglePause(proj.id)}
                            className="h-7 text-xs border-border-strong text-ink hover:bg-canvas gap-1"
                          >
                            {proj.status === 'active' ? (
                              <>
                                <Pause className="size-3" />
                                {t('projects.pause')}
                              </>
                            ) : (
                              <>
                                <Play className="size-3" />
                                {t('projects.reactivate')}
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDeleteId(proj.id)}
                          className="h-7 text-xs text-magenta hover:bg-magenta/5 font-bold gap-1"
                        >
                          <Trash2 className="size-3" />
                          {t('projects.delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete confirmation modal */}
      {confirmDeleteId !== null && projectToDelete !== undefined && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/40 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-magenta/10 text-magenta rounded-xl shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-ink-strong text-base leading-snug">
                  {t('projects.delete_confirm_title')}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5 font-medium italic">
                  {projectToDelete.title}
                </p>
              </div>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              {t('projects.delete_confirm_desc')}
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDeleteId(null)}
                className="border-border-strong text-ink hover:bg-canvas"
              >
                {t('projects.delete_cancel')}
              </Button>
              <Button
                size="sm"
                onClick={() => handleDelete(confirmDeleteId)}
                className="bg-magenta hover:bg-magenta/90 text-white font-bold gap-1"
              >
                <Trash2 className="size-3" />
                {t('projects.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
