'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Search,
  Filter,
  UserMinus,
  UserCheck,
  Star,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TalentStatus = 'active' | 'suspended';
type Specialty =
  | 'Frontend'
  | 'Backend'
  | 'Fullstack'
  | 'UX / Diseño'
  | 'Datos';

interface Talent {
  id: string;
  name: string;
  email: string;
  specialty: Specialty;
  stack: string[];
  applicationsCount: number;
  status: TalentStatus;
  joinedAt: string;
  matchAvg: number;
}

const INITIAL_TALENTS: Talent[] = [
  {
    id: 't1',
    name: 'Andrés Solano',
    email: 'andres.s@gmail.com',
    specialty: 'Frontend',
    stack: ['React', 'TypeScript', 'Tailwind'],
    applicationsCount: 4,
    status: 'active',
    joinedAt: '2026-05-10',
    matchAvg: 87,
  },
  {
    id: 't2',
    name: 'Fiorella Mora',
    email: 'fiorella.mora@fwd.cr',
    specialty: 'Fullstack',
    stack: ['Next.js', 'Node.js', 'PostgreSQL'],
    applicationsCount: 7,
    status: 'active',
    joinedAt: '2026-05-12',
    matchAvg: 92,
  },
  {
    id: 't3',
    name: 'Kendall Rojas',
    email: 'kendall.rojas@fwd.cr',
    specialty: 'Backend',
    stack: ['Express', 'Supabase', 'Docker'],
    applicationsCount: 2,
    status: 'active',
    joinedAt: '2026-04-28',
    matchAvg: 74,
  },
  {
    id: 't4',
    name: 'Juan Gabriel Mora',
    email: 'juan.g@gmail.com',
    specialty: 'Frontend',
    stack: ['Vue', 'Sass'],
    applicationsCount: 1,
    status: 'suspended',
    joinedAt: '2026-05-20',
    matchAvg: 61,
  },
  {
    id: 't5',
    name: 'Alisson Vargas',
    email: 'alisson.v@fwd.cr',
    specialty: 'UX / Diseño',
    stack: ['Figma', 'Framer', 'CSS'],
    applicationsCount: 5,
    status: 'active',
    joinedAt: '2026-05-05',
    matchAvg: 89,
  },
  {
    id: 't6',
    name: 'Diego Arce',
    email: 'diego.arce@gmail.com',
    specialty: 'Datos',
    stack: ['Python', 'SQL', 'Power BI'],
    applicationsCount: 3,
    status: 'active',
    joinedAt: '2026-06-01',
    matchAvg: 78,
  },
];

const SPECIALTY_ALL = 'all' as const;
const STATUS_ALL = 'all' as const;
type FilterSpecialty = Specialty | typeof SPECIALTY_ALL;
type FilterStatus = TalentStatus | typeof STATUS_ALL;

function matchColor(avg: number): string {
  if (avg >= 90) return 'text-accent';
  if (avg >= 70) return 'text-warning';
  return 'text-magenta';
}

export function Talento() {
  const t = useTranslations('admin');

  const [talents, setTalents] = React.useState<Talent[]>(INITIAL_TALENTS);
  const [search, setSearch] = React.useState('');
  const [specialtyFilter, setSpecialtyFilter] = React.useState<FilterSpecialty>(SPECIALTY_ALL);
  const [statusFilter, setStatusFilter] = React.useState<FilterStatus>(STATUS_ALL);

  const handleToggleStatus = (id: string) => {
    setTalents(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, status: t.status === 'active' ? 'suspended' : 'active' }
          : t
      )
    );
  };

  const filtered = talents.filter(talent => {
    const matchesSearch =
      talent.name.toLowerCase().includes(search.toLowerCase()) ||
      talent.email.toLowerCase().includes(search.toLowerCase()) ||
      talent.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty =
      specialtyFilter === SPECIALTY_ALL || talent.specialty === specialtyFilter;
    const matchesStatus = statusFilter === STATUS_ALL || talent.status === statusFilter;
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const specialties: Specialty[] = ['Frontend', 'Backend', 'Fullstack', 'UX / Diseño', 'Datos'];

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-ink-subtle" />
          <input
            id="talent-search"
            type="text"
            placeholder={t('talent.search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-surface border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="relative">
          <select
            id="talent-specialty-filter"
            value={specialtyFilter}
            onChange={e => setSpecialtyFilter(e.target.value as FilterSpecialty)}
            className="appearance-none pl-3 pr-8 py-2 bg-surface border border-border rounded-xl text-sm text-ink focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value={SPECIALTY_ALL}>{t('talent.filter_specialty')}</option>
            {specialties.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Filter className="absolute right-3 top-3 size-3 text-ink-subtle pointer-events-none" />
        </div>

        <div className="relative">
          <select
            id="talent-status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as FilterStatus)}
            className="appearance-none pl-3 pr-8 py-2 bg-surface border border-border rounded-xl text-sm text-ink focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value={STATUS_ALL}>{t('talent.filter_status')}</option>
            <option value="active">{t('talent.status_active')}</option>
            <option value="suspended">{t('talent.status_suspended')}</option>
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
                  {t('talent.col_talent')}
                </th>
                <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">
                  {t('talent.col_specialty')}
                </th>
                <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs hidden md:table-cell">
                  Stack
                </th>
                <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs text-center hidden sm:table-cell">
                  Match avg.
                </th>
                <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs text-center">
                  {t('talent.col_applications')}
                </th>
                <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">
                  {t('talent.col_status')}
                </th>
                <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs text-right">
                  {t('talent.col_actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-ink-muted">
                    {t('talent.empty')}
                  </td>
                </tr>
              ) : (
                filtered.map(talent => (
                  <tr
                    key={talent.id}
                    className={cn(
                      'hover:bg-surface-sunken/40 transition-colors duration-[var(--duration-fast)]',
                      talent.status === 'suspended' && 'opacity-60'
                    )}
                  >
                    {/* Nombre */}
                    <td className="p-4">
                      <p className="font-semibold text-ink-strong">{talent.name}</p>
                      <p className="text-xs text-ink-muted">{talent.email}</p>
                      <p className="text-[10px] text-ink-subtle mt-0.5">
                        Desde {talent.joinedAt}
                      </p>
                    </td>

                    {/* Especialización */}
                    <td className="p-4">
                      <Badge className="bg-secondary/5 text-secondary border border-secondary/10 font-bold uppercase tracking-wider text-[10px] px-2 py-0.5">
                        {talent.specialty}
                      </Badge>
                    </td>

                    {/* Stack */}
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {talent.stack.map(tech => (
                          <span
                            key={tech}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/8 text-primary uppercase tracking-wider"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Match avg */}
                    <td className="p-4 text-center hidden sm:table-cell">
                      <span
                        className={cn(
                          'font-mono font-bold text-sm flex items-center justify-center gap-1',
                          matchColor(talent.matchAvg)
                        )}
                      >
                        <Star className="size-3" />
                        {talent.matchAvg}%
                      </span>
                    </td>

                    {/* Postulaciones */}
                    <td className="p-4 text-center">
                      <span className="font-bold text-ink-strong">{talent.applicationsCount}</span>
                    </td>

                    {/* Estado */}
                    <td className="p-4">
                      <Badge
                        className={cn(
                          'border-none',
                          talent.status === 'active'
                            ? 'bg-accent/15 text-accent'
                            : 'bg-magenta/15 text-magenta'
                        )}
                      >
                        {t(`talent.status_${talent.status}`)}
                      </Badge>
                    </td>

                    {/* Acciones */}
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(talent.id)}
                        className={cn(
                          'h-7 text-xs font-bold gap-1 rounded-md px-2',
                          talent.status === 'active'
                            ? 'text-magenta hover:bg-magenta/5'
                            : 'text-accent hover:bg-accent/5'
                        )}
                      >
                        {talent.status === 'active' ? (
                          <>
                            <UserMinus className="size-3.5" />
                            {t('talent.actions_suspend')}
                          </>
                        ) : (
                          <>
                            <UserCheck className="size-3.5" />
                            {t('talent.actions_activate')}
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary footer */}
      {filtered.length > 0 && (
        <p className="text-xs text-ink-subtle text-right">
          {filtered.length} {filtered.length === 1 ? 'egresado' : 'egresados'} mostrados
        </p>
      )}
    </div>
  );
}
