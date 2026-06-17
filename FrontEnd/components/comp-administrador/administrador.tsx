'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Users,
  Building2,
  FolderKanban,
  Clock,
  Search,
  Filter,
  Check,
  X,
  Shield,
  UserMinus,
  UserCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Proyectos } from '@/components/comp-administrador/proyectos';
import { Talento } from '@/components/comp-administrador/talento';
import { Reportes } from '@/components/comp-administrador/reportes';
import { Configuracion } from '@/components/comp-administrador/configuracion';

// Mock Data Inicial
const INITIAL_APPLICATIONS = [
  { id: '1', name: 'Alonso Chaves', email: 'alonso.chaves@fwd.cr', specialty: 'Frontend Developer', date: '2026-06-12', status: 'pending' },
  { id: '2', name: 'Fiorella Mora', email: 'fiorella.mora@fwd.cr', specialty: 'Fullstack Developer', date: '2026-06-14', status: 'pending' },
  { id: '3', name: 'Kendall Rojas', email: 'kendall.rojas@fwd.cr', specialty: 'Backend Developer', date: '2026-06-10', status: 'pending' }
];

const INITIAL_USERS = [
  { id: '101', name: 'Andrés Solano', email: 'andres.s@gmail.com', role: 'student', status: 'active' },
  { id: '102', name: 'Acme Corporación', email: 'contacto@acme.com', role: 'company', status: 'active' },
  { id: '103', name: 'Valeria Fonseca', email: 'valeria.f@fwd.cr', role: 'admin', status: 'active' },
  { id: '104', name: 'Juan Gabriel', email: 'juan.g@gmail.com', role: 'student', status: 'suspended' },
  { id: '105', name: 'Innovatech S.A.', email: 'hr@innovatech.cr', role: 'company', status: 'active' }
];

const INITIAL_PROJECTS = [
  { id: '201', title: 'Portal E-commerce Pymes', company: 'Acme Corporación', budget: 1200, status: 'moderation' },
  { id: '202', title: 'Dashboard de Analítica', company: 'Innovatech S.A.', budget: 900, status: 'active' },
  { id: '203', title: 'App Móvil Inventario', company: 'TechFlow Systems', budget: 1500, status: 'paused' }
];

const INITIAL_COMPANIES = [
  { id: '301', name: 'Acme Corporación', sector: 'Tecnología', status: 'approved' },
  { id: '302', name: 'Pixel Studio', sector: 'Diseño / UX', status: 'pending' },
  { id: '303', name: 'Agrotica S.A.', sector: 'Agricultura / Exportación', status: 'pending' }
];

type TabType = 'applications' | 'users' | 'projects' | 'companies' | 'talent' | 'reports' | 'config';

export function Administrador() {
  const t = useTranslations('admin');

  // Estados reactivos locales para simulación
  const [activeTab, setActiveTab] = React.useState<TabType>('applications');
  const [applications, setApplications] = React.useState(INITIAL_APPLICATIONS);
  const [users, setUsers] = React.useState(INITIAL_USERS);
  const [companies, setCompanies] = React.useState(INITIAL_COMPANIES);

  // Filtros de usuarios
  const [userSearch, setUserSearch] = React.useState('');
  const [userRoleFilter, setUserRoleFilter] = React.useState('all');

  // Cálculos de KPIs dinámicos
  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;
  const totalStudents = users.filter(u => u.role === 'student').length + applications.filter(a => a.status === 'approved').length;
  const approvedCompanies = companies.filter(c => c.status === 'approved').length;
  // KPI de proyectos activos — valor mock (la fuente de verdad vive en el componente Proyectos)
  const activeProjCount = INITIAL_PROJECTS.filter(p => p.status === 'active').length;

  // Acciones: Solicitudes
  const handleApproveApp = (id: string) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    // Opcionalmente agregar al listado de usuarios como estudiante
    const app = applications.find(a => a.id === id);
    if (app) {
      setUsers(prev => [...prev, { id: `new-${id}`, name: app.name, email: app.email, role: 'student', status: 'active' }]);
    }
  };

  const handleRejectApp = (id: string) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
  };

  // Acciones: Usuarios
  const handleToggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
  };

  const handleChangeUserRole = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextRole = u.role === 'student' ? 'company' : u.role === 'company' ? 'admin' : 'student';
        return { ...u, role: nextRole };
      }
      return u;
    }));
  };



  // Acciones: Empresas
  const handleApproveCompany = (id: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
  };

  const handleRejectCompany = (id: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
  };

  const handleSuspendCompany = (id: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'approved' ? 'pending' : 'approved' };
      }
      return c;
    }));
  };

  // Filtrado de usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-canvas font-sans text-ink">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-ink-strong tracking-tight">
          {t('title')}<span className="text-primary">.</span>
        </h1>
        <p className="text-ink-muted text-sm md:text-base">
          {t('subtitle')}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 border-border bg-surface flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Users className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-subtle uppercase tracking-wider">{t('stats.total_students')}</p>
            <p className="text-2xl font-heading font-black text-ink-strong">{totalStudents}</p>
          </div>
        </Card>

        <Card className="p-5 border-border bg-surface flex items-center gap-4">
          <div className="p-3 bg-accent/10 text-accent rounded-xl">
            <Building2 className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-subtle uppercase tracking-wider">{t('stats.active_companies')}</p>
            <p className="text-2xl font-heading font-black text-ink-strong">{approvedCompanies}</p>
          </div>
        </Card>

        <Card className="p-5 border-border bg-surface flex items-center gap-4">
          <div className="p-3 bg-highlight/10 text-primary rounded-xl">
            <FolderKanban className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-subtle uppercase tracking-wider">{t('stats.active_projects')}</p>
            <p className="text-2xl font-heading font-black text-ink-strong">{activeProjCount}</p>
          </div>
        </Card>

        <Card className="p-5 border-border bg-surface flex items-center gap-4">
          <div className="p-3 bg-warning/10 text-warning rounded-xl">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink-subtle uppercase tracking-wider">{t('stats.pending_approvals')}</p>
            <p className="text-2xl font-heading font-black text-ink-strong">{pendingAppsCount}</p>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border flex overflow-x-auto no-scrollbar gap-2">
        {(['applications', 'users', 'projects', 'companies', 'talent', 'reports', 'config'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "py-3 px-5 font-heading text-xs md:text-sm font-bold tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "text-primary border-primary"
                : "text-ink-muted border-transparent hover:text-ink hover:border-border"
            )}
          >
            {t(`tabs.${tab}`).toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">

        {/* VIEW: SOLICITUDES DE ESTUDIANTES */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg md:text-xl font-extrabold text-ink-strong uppercase tracking-tight">
              {t('applications.title')}
            </h2>
            <Card className="overflow-hidden border-border bg-surface">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-sunken border-b border-border">
                      <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">{t('applications.name')}</th>
                      <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">{t('applications.specialization')}</th>
                      <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">{t('applications.date')}</th>
                      <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">{t('applications.status')}</th>
                      <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs text-right">{t('applications.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-ink-muted">
                          {t('applications.empty')}
                        </td>
                      </tr>
                    ) : (
                      applications.map(app => (
                        <tr key={app.id} className="hover:bg-surface-sunken/40 transition-colors">
                          <td className="p-4">
                            <p className="font-semibold text-ink-strong">{app.name}</p>
                            <p className="text-xs text-ink-muted">{app.email}</p>
                          </td>
                          <td className="p-4 text-ink-muted">{app.specialty}</td>
                          <td className="p-4 text-ink-muted">{app.date}</td>
                          <td className="p-4">
                            <Badge className={cn(
                              "border-none",
                              app.status === 'pending' && "bg-warning/15 text-warning",
                              app.status === 'approved' && "bg-accent/15 text-accent",
                              app.status === 'rejected' && "bg-magenta/15 text-magenta"
                            )}>
                              {t(`applications.${app.status}`)}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            {app.status === 'pending' ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveApp(app.id)}
                                  className="bg-accent hover:bg-accent/90 text-white gap-1 rounded-full text-xs font-bold px-3 py-1 h-7"
                                >
                                  <Check className="size-3" /> {t('applications.approve')}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleRejectApp(app.id)}
                                  className="bg-magenta hover:bg-magenta/90 text-white gap-1 rounded-full text-xs font-bold px-3 py-1 h-7"
                                >
                                  <X className="size-3" /> {t('applications.reject')}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-ink-subtle font-medium italic">Procesada</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* VIEW: GESTION DE USUARIOS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="font-heading text-lg md:text-xl font-extrabold text-ink-strong uppercase tracking-tight">
                {t('users.title')}
              </h2>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-2.5 size-4 text-ink-subtle" />
                  <input
                    type="text"
                    placeholder={t('users.search_placeholder')}
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full sm:w-60 bg-surface border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 bg-surface border border-border rounded-xl text-sm text-ink focus:border-primary focus:outline-none cursor-pointer"
                  >
                    <option value="all">{t('users.filter_role')}</option>
                    <option value="student">{t('users.role_student')}</option>
                    <option value="company">{t('users.role_company')}</option>
                    <option value="admin">{t('users.role_admin')}</option>
                  </select>
                  <Filter className="absolute right-3 top-3 size-3 text-ink-subtle pointer-events-none" />
                </div>
              </div>
            </div>

            <Card className="overflow-hidden border-border bg-surface">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-sunken border-b border-border">
                      <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">Usuario</th>
                      <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">Rol</th>
                      <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">Estado</th>
                      <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs text-right">{t('users.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-ink-muted">
                          No se encontraron usuarios.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-surface-sunken/40 transition-colors">
                          <td className="p-4">
                            <p className="font-semibold text-ink-strong">{user.name}</p>
                            <p className="text-xs text-ink-muted">{user.email}</p>
                          </td>
                          <td className="p-4">
                            <Badge className="bg-secondary/5 text-secondary border border-secondary/10 font-bold uppercase tracking-wider text-[10px] px-2 py-0.5">
                              {t(`users.role_${user.role}`)}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={cn(
                              "border-none",
                              user.status === 'active' ? "bg-accent/15 text-accent" : "bg-magenta/15 text-magenta"
                            )}>
                              {t(`users.status_${user.status}`)}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleChangeUserRole(user.id)}
                                className="h-7 text-xs border-border-strong text-ink hover:bg-canvas"
                              >
                                <Shield className="size-3 mr-1" /> {t('users.change_role')}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleUserStatus(user.id)}
                                className={cn(
                                  "h-7 text-xs font-bold gap-1 rounded-md px-2",
                                  user.status === 'active' ? "text-magenta hover:bg-magenta/5" : "text-accent hover:bg-accent/5"
                                )}
                              >
                                {user.status === 'active' ? (
                                  <>
                                    <UserMinus className="size-3.5" /> {t('users.suspend')}
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="size-3.5" /> {t('users.activate')}
                                  </>
                                )}
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
          </div>
        )}



        {activeTab === 'companies' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg md:text-xl font-extrabold text-ink-strong uppercase tracking-tight">
              {t('companies.title')}
            </h2>
            <Card className="overflow-hidden border-border bg-surface">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-sunken border-b border-border">
                      <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">Empresa</th>
                      <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">{t('companies.sector')}</th>
                      <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs">Estado</th>
                      <th className="p-4 font-bold text-ink-strong uppercase tracking-wider text-xs text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {companies.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-ink-muted">
                          No hay empresas registradas.
                        </td>
                      </tr>
                    ) : (
                      companies.map(comp => (
                        <tr key={comp.id} className="hover:bg-surface-sunken/40 transition-colors">
                          <td className="p-4 font-semibold text-ink-strong">{comp.name}</td>
                          <td className="p-4 text-ink-muted">{comp.sector}</td>
                          <td className="p-4">
                            <Badge className={cn(
                              "border-none",
                              comp.status === 'approved' && "bg-accent/15 text-accent",
                              comp.status === 'pending' && "bg-warning/15 text-warning",
                              comp.status === 'rejected' && "bg-magenta/15 text-magenta"
                            )}>
                              {t(`companies.status_${comp.status}`)}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              {comp.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveCompany(comp.id)}
                                    className="bg-accent hover:bg-accent/90 text-white rounded-full text-xs font-bold px-3 py-1 h-7"
                                  >
                                    {t('companies.approve')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleRejectCompany(comp.id)}
                                    className="bg-magenta hover:bg-magenta/90 text-white rounded-full text-xs font-bold px-3 py-1 h-7"
                                  >
                                    {t('companies.reject')}
                                  </Button>
                                </>
                              )}
                              {comp.status === 'approved' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSuspendCompany(comp.id)}
                                  className="h-7 text-xs border-border-strong text-ink hover:bg-canvas"
                                >
                                  {t('companies.suspend')}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* VIEW: GESTION DE PROYECTOS (componente rico) */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg md:text-xl font-extrabold text-ink-strong uppercase tracking-tight">
              {t('projects.title')}
            </h2>
            <Proyectos />
          </div>
        )}

        {/* VIEW: TALENTO */}
        {activeTab === 'talent' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg md:text-xl font-extrabold text-ink-strong uppercase tracking-tight">
              {t('talent.title')}<span className="text-primary">.</span>
            </h2>
            <Talento />
          </div>
        )}

        {/* VIEW: REPORTES */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg md:text-xl font-extrabold text-ink-strong uppercase tracking-tight">
              {t('reports.title')}<span className="text-primary">.</span>
            </h2>
            <Reportes />
          </div>
        )}

        {/* VIEW: CONFIGURACION */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg md:text-xl font-extrabold text-ink-strong uppercase tracking-tight">
              {t('config.title')}<span className="text-primary">.</span>
            </h2>
            <Configuracion />
          </div>
        )}
      </div>
    </div>
  );
}