import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin } from 'lucide-react';

export default function FeaturedProjectsSection() {
  const t = useTranslations('landing.featured_projects');

  const projects = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechNova',
      tags: ['React', 'Next.js', 'Tailwind CSS'],
      match: 88,
      weeks: 6,
      modality: 'Remoto',
      iconBg: 'bg-secondary',
      iconLetter: 'T'
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
      iconLetter: 'F'
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
      iconLetter: 'D'
    }
  ];

  return (
    <section className="py-24 bg-canvas text-ink relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 space-y-4">
          <p className="text-secondary font-bold text-sm tracking-widest uppercase">{t('eyebrow')}</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-ink-strong">
            {t('title')}<span className="text-primary">.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {projects.map((project) => (
            <div key={project.id} className="bg-surface rounded-xl p-6 shadow-soft hover:shadow-elevated transition-shadow border border-border relative">
              {project.match > 80 && (
                <div className="absolute -top-3 left-6 px-3 py-1 bg-magenta/10 text-magenta text-xs font-bold rounded flex items-center">
                  {t('badge_featured')}
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-4 mt-2">
                <div className={`w-12 h-12 rounded-lg ${project.iconBg} flex items-center justify-center text-white font-bold text-xl`}>
                  {project.iconLetter}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-ink-strong">{project.title}</h3>
                  <p className="text-ink-muted text-sm">{project.company}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map(tag => (
                  <span key={tag} className="bg-surface-sunken px-2 py-1 rounded text-xs font-medium text-ink">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex gap-4 text-sm text-ink-muted">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {project.weeks} {t('duration')}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {project.modality}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full border-[3px] border-accent text-accent font-bold text-sm">
                  {project.match}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/marketplace" className="inline-flex items-center text-secondary font-bold hover:text-primary transition-colors">
            {t('link_all')} <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
