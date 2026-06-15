import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FwdGeoBackdrop } from '@/components/ui/fwd-geo-backdrop';

export default function CtaSection({ locale }: { locale: string }) {
  const t = useTranslations('landing.cta');

  return (
    <section className="relative overflow-hidden bg-secondary py-24 text-secondary-foreground">
      <FwdGeoBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row md:px-10">
        <div className="max-w-xl flex-1 space-y-4 text-center md:text-left">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t('title')}<span className="text-highlight">.</span>
          </h2>
          <p className="text-lg text-white/80">
            {t('description')}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
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
            {t('cta_register')}
          </Link>
        </div>
      </div>
    </section>
  );
}
