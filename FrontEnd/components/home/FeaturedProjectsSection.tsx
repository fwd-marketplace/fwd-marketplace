import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin } from 'lucide-react';

const FEATURED_PROJECTS = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'TechNova',
    tags: ['React', 'Next.js', 'Tailwind CSS'],
    match: 88,
    weeks: 6,
    modality: 'Remoto',
    iconBg: 'bg-secondary',
    iconLetter: 'T',
  },
  {
    id: 2,
    title: 'Asistente IA',
    company: 'Forward Labs',
    tags: ['Python', 'LLM', 'RAG'],
    match: 95,
    weeks: 4,
    modality: 'Remoto',
    iconBg: 'bg-accent',
    iconLetter: 'F',
  },
  {
    id: 3,
    title: 'Dashboard Analytics',
    company: 'Data Studio',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    match: 73,
    weeks: 10,
    modality: 'Híbrido',
    iconBg: 'bg-highlight',
    iconLetter: 'D',
  },
];

export default function FeaturedProjectsSection({ locale }: { locale: string }) {
  const t = useTranslations('landing.featured_projects');

  return (
    <section className="relative bg-canvas py-24 text-ink">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-secondary">{t('eyebrow')}</p>
          <h2 className="font-heading text-3xl font-bold text-ink-strong md:text-4xl">
            {t('title')}<span className="text-primary">.</span>
          </h2>
        </div>

        <div className="mb-12 grid gap-8 md:grid-cols-3">
          {FEATURED_PROJECTS.map((project) => (
            <div
              key={project.id}
              className="relative rounded-xl border border-border bg-surface p-6 shadow-soft transition-shadow hover:shadow-elevated"
            >
              {project.match > 80 && (
                <div className="absolute -top-3 left-6 flex items-center rounded bg-magenta/10 px-3 py-1 text-xs font-bold text-magenta">
                  {t('badge_featured')}
                </div>
              )}

              <div className="mb-4 mt-2 flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${project.iconBg} text-xl font-bold text-white`}>
                  {project.iconLetter}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink-strong">{project.title}</h3>
                  <p className="text-sm text-ink-muted">{project.company}</p>
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded bg-surface-sunken px-2 py-1 text-xs font-medium text-ink">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex gap-4 text-sm text-ink-muted">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {project.weeks} {t('duration')}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {project.modality}
                  </div>
                </div>
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border-[3px] border-accent text-sm font-bold text-accent">
                  {project.match}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href={`/${locale}/marketplace`}
            className="inline-flex items-center font-bold text-secondary transition-colors hover:text-primary"
          >
            {t('link_all')} <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
