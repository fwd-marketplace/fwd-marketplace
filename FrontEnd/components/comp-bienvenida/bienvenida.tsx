'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Folder,
  Building2,
  Send,
  LineChart,
  GraduationCap,
  BarChart,
  Compass,
  BookOpen,
  Mountain,
  Sparkles,
  Trophy,
  Eye,
  Gift,
  Star
} from 'lucide-react';
import { FwdGeoBackdrop } from '@/components/ui/fwd-geo-backdrop';
import { Button } from '@/components/ui/button';
import { EstrellaProceso } from '@/components/comp-bienvenida/EstrellaProceso';

// TODO: replace with real API data once backend integration is complete
const recommendedProjects = [
  {
    id: 1,
    title: 'Rediseño App Fintech',
    company: 'FinPay',
    badge: 'urgent' as const,
    match: 93,
    duration: 6,
    modality: 'remote' as const,
    tags: ['React', 'TypeScript', 'Tailwind'],
    icon: 'line-chart'
  },
  {
    id: 2,
    title: 'Plataforma Educativa',
    company: 'EduConnect',
    badge: 'high_match' as const,
    match: 91,
    duration: 8,
    modality: 'remote' as const,
    tags: ['Next.js', 'Supabase', 'PostgreSQL'],
    icon: 'graduation-cap'
  },
  {
    id: 3,
    title: 'Dashboard Analytics',
    company: 'DataNova',
    badge: 'new' as const,
    match: 85,
    duration: 4,
    modality: 'hybrid' as const,
    tags: ['React', 'Node.js', 'MongoDB'],
    icon: 'bar-chart'
  }
];

const interestedCompanies = [
  { id: 1, name: 'TechNova', searching: 'Buscando Frontend Developer', initials: 'TN', color: 'bg-secondary' },
  { id: 2, name: 'Forward Labs', searching: 'Buscando talento en IA y Datos', initials: 'FL', color: 'bg-accent' },
  { id: 3, name: 'Data Studio', searching: 'Buscando Fullstack Developer', initials: 'DS', color: 'bg-primary' }
];

const recentActivity = [
  {
    id: 1,
    title: 'Nuevo proyecto compatible',
    desc: 'Plataforma Educativa tiene 91% de match con tu perfil.',
    time: 'Hace 1 hora',
    icon: Gift,
    iconColor: 'text-secondary',
    bgColor: 'bg-secondary/10'
  },
  {
    id: 2,
    title: 'Empresa visitó tu perfil',
    desc: 'EduConnect revisó tu perfil completo.',
    time: 'Hace 3 horas',
    icon: Eye,
    iconColor: 'text-accent',
    bgColor: 'bg-accent/10'
  },
  {
    id: 3,
    title: 'Nueva vacante publicada',
    desc: 'Dashboard Analytics se publicó hoy.',
    time: 'Ayer',
    icon: Star,
    iconColor: 'text-warning',
    bgColor: 'bg-warning/10'
  }
];

type GreetingKey = 'greeting_morning' | 'greeting_afternoon' | 'greeting_evening';

/** Saludo según la hora LOCAL del usuario (mañana / tarde / noche). */
function greetingForHour(hour: number): GreetingKey {
  if (hour >= 5 && hour < 12) return 'greeting_morning';
  if (hour >= 12 && hour < 19) return 'greeting_afternoon';
  return 'greeting_evening';
}

export function BienvenidaDashboard() {
  const t = useTranslations('bienvenida');
  const locale = useLocale();

  // Se calcula tras montar (useEffect) para usar la hora del navegador del
  // usuario y evitar el mismatch de hidratación: el servidor no conoce su zona.
  const [greetingKey, setGreetingKey] = useState<GreetingKey>('greeting_morning');
  useEffect(() => {
    setGreetingKey(greetingForHour(new Date().getHours()));
  }, []);

  const modalityLabel: Record<string, string> = {
    remote: t('modality.remote'),
    hybrid: t('modality.hybrid'),
    onsite: t('modality.onsite'),
  };

  return (
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

          {/* Right Column (Constellation Network Simulation) */}
          <div className="hidden lg:flex flex-1 relative h-[400px] w-full items-center justify-center">
            
            {/* Background Stars */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute rounded-full bg-white"
                  style={{
                    width: Math.random() * 3 + 1 + 'px',
                    height: Math.random() * 3 + 1 + 'px',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.5 + 0.1,
                    animation: `pulse ${Math.random() * 3 + 2}s infinite ${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>

            {/* Center Node (Enhanced with double ring and glow) */}
            <div className="absolute z-30 flex h-36 w-36 items-center justify-center rounded-full border border-primary/40 bg-secondary/80 backdrop-blur-md shadow-[0_0_60px_rgba(102,45,145,0.7)]">
              <div className="absolute inset-0 rounded-full border border-white/20 scale-[0.85]" />
              <div className="absolute inset-0 rounded-full border border-magenta/30 scale-[1.15]" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">Tu Progreso</span>
            </div>

            {/* Orbit paths with depth */}
            <div className="absolute h-[250px] w-[250px] rounded-full border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] z-10" />
            <div className="absolute h-[350px] w-[350px] rounded-full border border-white/5 shadow-[0_0_30px_rgba(255,255,255,0.02)] z-10" />

            {/* Nodes */}
            {/* El Llamado */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30 transition-transform duration-300 hover:scale-110 cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_20px_rgba(0,188,212,0.5)] border border-white/20">
                <Compass className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm bg-secondary/60 border border-white/10 px-3 py-1.5 rounded backdrop-blur-md shadow-lg">El Llamado</span>
            </div>

            {/* La Preparación */}
            <div className="absolute top-1/4 right-0 flex flex-col items-center gap-2 z-30 transition-transform duration-300 hover:scale-110 cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary border border-white/30 text-white shadow-[0_0_20px_rgba(102,45,145,0.5)]">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm bg-secondary/60 border border-white/10 px-3 py-1.5 rounded backdrop-blur-md shadow-lg">La Preparación</span>
            </div>

            {/* El Desafío */}
            <div className="absolute bottom-4 right-1/4 flex flex-col items-center gap-2 z-30 transition-transform duration-300 hover:scale-110 cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_20px_rgba(0,188,212,0.5)] border border-white/20">
                <Mountain className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm bg-secondary/60 border border-white/10 px-3 py-1.5 rounded backdrop-blur-md shadow-lg">El Desafío</span>
            </div>

            {/* La Transformación */}
            <div className="absolute bottom-10 left-1/4 flex flex-col items-center gap-2 z-30 transition-transform duration-300 hover:scale-110 cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-[0_0_20px_rgba(255,107,107,0.5)] border border-white/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm bg-secondary/60 border border-white/10 px-3 py-1.5 rounded backdrop-blur-md shadow-lg">La Transformación</span>
            </div>

            {/* El Reconocimiento */}
            <div className="absolute top-1/3 left-4 flex flex-col items-center gap-2 z-30 transition-transform duration-300 hover:scale-110 cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-magenta text-white shadow-[0_0_20px_rgba(236,0,140,0.5)] border border-white/20">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm bg-secondary/60 border border-white/10 px-3 py-1.5 rounded backdrop-blur-md shadow-lg">El Reconocimiento</span>
            </div>

            {/* Lines connecting (Astronomical Constellation style) */}
            <style>{`
              @keyframes constellationPulse {
                0%, 100% { opacity: 0.3; filter: drop-shadow(0 0 2px rgba(255,255,255,0.4)); }
                50% { opacity: 1; filter: drop-shadow(0 0 8px rgba(255,255,255,0.9)); }
              }
              .constellation-line {
                animation: constellationPulse 3s ease-in-out infinite;
                stroke-dasharray: 1 6;
                stroke-linecap: round;
              }
              .secondary-line {
                stroke-dasharray: 2 4;
                opacity: 0.15;
              }
            `}</style>
            <svg className="absolute inset-0 h-full w-full pointer-events-none" style={{ zIndex: 20 }}>
              {/* Primary connections to center */}
              <line x1="50%" y1="10%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" className="constellation-line" />
              <line x1="15%" y1="35%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" className="constellation-line" style={{ animationDelay: '0.5s' }} />
              <line x1="25%" y1="80%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" className="constellation-line" style={{ animationDelay: '1s' }} />
              <line x1="75%" y1="85%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" className="constellation-line" style={{ animationDelay: '1.5s' }} />
              <line x1="85%" y1="35%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" className="constellation-line" style={{ animationDelay: '2s' }} />
              
              {/* Secondary connections (Network web) */}
              <line x1="50%" y1="10%" x2="85%" y2="35%" stroke="rgba(255,255,255,0.5)" strokeWidth="1" className="secondary-line" />
              <line x1="85%" y1="35%" x2="75%" y2="85%" stroke="rgba(255,255,255,0.5)" strokeWidth="1" className="secondary-line" />
              <line x1="75%" y1="85%" x2="25%" y2="80%" stroke="rgba(255,255,255,0.5)" strokeWidth="1" className="secondary-line" />
              <line x1="25%" y1="80%" x2="15%" y2="35%" stroke="rgba(255,255,255,0.5)" strokeWidth="1" className="secondary-line" />
              <line x1="15%" y1="35%" x2="50%" y2="10%" stroke="rgba(255,255,255,0.5)" strokeWidth="1" className="secondary-line" />

              {/* Luminous stars on the connection lines */}
              <circle cx="50%" cy="30%" r="2" fill="white" className="constellation-line" />
              <circle cx="32%" cy="42%" r="1.5" fill="white" className="constellation-line" style={{ animationDelay: '0.3s' }} />
              <circle cx="37%" cy="65%" r="2" fill="white" className="constellation-line" style={{ animationDelay: '0.8s' }} />
              <circle cx="62%" cy="67%" r="1.5" fill="white" className="constellation-line" style={{ animationDelay: '1.2s' }} />
              <circle cx="67%" cy="42%" r="2" fill="white" className="constellation-line" style={{ animationDelay: '1.8s' }} />
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
              <div className="font-heading text-3xl font-bold">18</div>
              <div className="text-sm font-medium text-ink-strong">{t('stats.projects')}</div>
              <Link href="#" className="text-xs text-primary font-medium hover:underline flex items-center mt-1">
                {t('stats.view_all')} <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
          <div className="bg-surface rounded-xl p-6 shadow-soft flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-accent text-accent">
              <span className="font-bold text-lg">92%</span>
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
              <div className="font-heading text-3xl font-bold">4</div>
              <div className="text-sm font-medium text-ink-strong">{t('stats.companies')}</div>
              <div className="text-xs text-ink-muted mt-1">{t('stats.companies_desc')}</div>
            </div>
          </div>
          <div className="bg-surface rounded-xl p-6 shadow-soft flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <div className="font-heading text-3xl font-bold">3</div>
              <div className="text-sm font-medium text-ink-strong">{t('stats.applications')}</div>
              <Link href="#" className="text-xs text-primary font-medium hover:underline flex items-center mt-1">
                {t('stats.view_applications')} <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recommended Projects */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ink-strong">{t('recommended.title')}</h2>
            <Link href="#" className="text-sm font-medium text-primary hover:underline flex items-center">
              {t('recommended.view_all')} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <button className="absolute -left-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-surface shadow-soft border border-border z-10 hidden lg:flex hover:bg-canvas">
              <ChevronLeft className="h-4 w-4 text-ink" />
            </button>
            <button className="absolute -right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-surface shadow-soft border border-border z-10 hidden lg:flex hover:bg-canvas">
              <ChevronRight className="h-4 w-4 text-ink" />
            </button>

            {recommendedProjects.map((project) => (
              <div key={project.id} className="bg-surface rounded-xl p-6 shadow-soft border border-border">
                <div className="mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-canvas ${project.badge === 'urgent' ? 'text-magenta' : project.badge === 'high_match' ? 'text-accent' : 'text-primary'}`}>
                    {t(`recommended.badges.${project.badge as 'urgent' | 'high_match' | 'new'}`)}
                  </span>
                </div>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${project.badge === 'urgent' ? 'bg-magenta/10 text-magenta' : project.badge === 'high_match' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                    {project.icon === 'line-chart' && <LineChart className="h-5 w-5" />}
                    {project.icon === 'graduation-cap' && <GraduationCap className="h-5 w-5" />}
                    {project.icon === 'bar-chart' && <BarChart className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-ink-strong">{project.title}</h3>
                    <div className="text-sm text-ink-muted flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {project.company}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-canvas border border-border rounded-md text-xs text-ink">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-ink-muted">
                    <span>{project.duration} {t('recommended.weeks')}</span>
                    <span className="h-1 w-1 rounded-full bg-ink-subtle"></span>
                    <span>{modalityLabel[project.modality]}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-accent text-accent font-bold text-sm">
                      {project.match}%
                    </div>
                    <span className="text-[10px] text-accent mt-1 font-medium">{t('recommended.match')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Progress & Companies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-ink-strong mb-4">{t('progress.title')}</h2>
            <EstrellaProceso />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ink-strong">{t('companies.title')}</h2>
              <Link href="#" className="text-sm font-medium text-primary hover:underline flex items-center">
                {t('companies.view_all')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-surface rounded-xl p-6 shadow-soft border border-border flex flex-col h-[calc(100%-2rem)]">
              <div className="space-y-6 flex-1">
                {interestedCompanies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${company.color}`}>
                        {company.initials}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-ink-strong">{company.name}</div>
                        <div className="text-xs text-ink-muted">{company.searching}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-accent tracking-wider">
                      {t('companies.active')}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6 rounded-full border-secondary text-secondary hover:bg-secondary/5 hover:text-secondary">
                {t('companies.btn_all')}
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ink-strong">{t('activity.title')}</h2>
            <Link href="#" className="text-sm font-medium text-primary hover:underline flex items-center">
              {t('activity.view_all')} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="bg-surface rounded-xl shadow-soft border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-canvas/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.bgColor} ${activity.iconColor}`}>
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-ink-strong">{activity.title}</div>
                      <div className="text-xs text-ink-muted">{activity.desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-ink-muted">
                    <span>{activity.time}</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}