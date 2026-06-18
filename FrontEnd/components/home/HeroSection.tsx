import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ConstellationBackdrop } from '@/components/home/ConstellationBackdrop';
import { LogoConstellation } from '@/components/home/LogoConstellation';
import { isAuthenticated } from '@/lib/auth-session';

export default async function HeroSection({ locale }: { locale: string }) {
  const t = await getTranslations('landing.hero');

  // Sin sesion iniciada, "Ver proyectos" lleva al registro en vez del marketplace.
  const hasSession = await isAuthenticated();
  const projectsHref = hasSession
    ? `/${locale}/marketplace`
    : `/${locale}/register`;

  return (
    <section className="relative overflow-hidden bg-secondary py-20 text-secondary-foreground lg:py-32">
      <ConstellationBackdrop />

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
              href={projectsHref}
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

        {/* Right Column: animated constellation logo */}
        <div className="w-full max-w-lg flex-1 flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[450px] md:max-w-[500px]">
            <LogoConstellation logoAlt={t('logo_alt')} />
          </div>
        </div>
      </div>
    </section>
  );
}
