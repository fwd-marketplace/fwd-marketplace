import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin, DollarSign } from 'lucide-react';
import { FwdGeoBackdrop } from '@/components/ui/fwd-geo-backdrop';

export default function HeroSection({ locale }: { locale: string }) {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative overflow-hidden bg-secondary py-20 text-secondary-foreground lg:py-32">
      <FwdGeoBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-6 md:px-10 lg:flex-row lg:gap-24">
        {/* Left Column */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-highlight">
              {t('eyebrow')}
            </h2>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              {t('title')}<span className="text-highlight">.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/80 md:text-xl lg:mx-0">
              {t('description')}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <Link
              href={`/${locale}/marketplace`}
              className="inline-flex h-12 items-center justify-center rounded-full bg-highlight px-8 font-semibold text-highlight-foreground transition-opacity hover:opacity-90"
            >
              {t('cta_projects')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href={`/${locale}/register`}
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-8 font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t('cta_company')}
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Card */}
        <div className="w-full max-w-lg flex-1">
          <div className="rounded-xl bg-surface p-6 text-ink-strong shadow-elevated">
            {/* Window dots */}
            <div className="mb-4 flex space-x-1.5">
              <div className="h-3 w-3 rounded-full bg-magenta" aria-hidden="true" />
              <div className="h-3 w-3 rounded-full bg-warning" aria-hidden="true" />
              <div className="h-3 w-3 rounded-full bg-success" aria-hidden="true" />
            </div>

            <p className="mb-2 text-xs font-bold uppercase text-magenta">{t('card_eyebrow')}</p>
            <h3 className="mb-1 font-heading text-2xl font-bold">{t('card_title')}</h3>
            <p className="mb-4 flex items-center gap-2 text-ink-muted">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-ink-subtle text-xs text-white">
                E
              </span>
              {t('card_company')}
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
              {['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'].map((tech) => (
                <span key={tech} className="rounded-full border border-border bg-canvas px-3 py-1 text-sm">
                  {tech}
                </span>
              ))}
            </div>

            <div className="mb-6 flex items-center justify-between border-b border-border pb-6">
              <div className="flex gap-6 text-sm text-ink-muted">
                <div>
                  <div className="mb-1 flex items-center gap-1">
                    <Clock className="h-4 w-4" aria-hidden="true" /> {t('card_duration')}
                  </div>
                  <strong className="text-ink-strong">{t('card_duration_val')}</strong>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden="true" /> {t('card_modality')}
                  </div>
                  <strong className="text-ink-strong">{t('card_modality_val')}</strong>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1">
                    <DollarSign className="h-4 w-4" aria-hidden="true" /> {t('card_budget')}
                  </div>
                  <strong className="text-ink-strong">{t('card_budget_val')}</strong>
                </div>
              </div>

              <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-accent font-bold text-xl text-accent">
                92%
                <span className="absolute -bottom-5 text-[10px] text-ink-muted">{t('card_match')}</span>
              </div>
            </div>

            <Link
              href="#"
              className="flex items-center justify-between font-medium text-primary hover:underline"
            >
              {t('card_link')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
