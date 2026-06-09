import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CtaSection() {
  const t = useTranslations('landing.cta');

  return (
    <section className="relative overflow-hidden bg-secondary text-secondary-foreground py-24">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {/* Placeholder for geometry background */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg"></svg>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 max-w-xl text-center md:text-left space-y-4">
          <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight text-white">
            {t('title')}<span className="text-highlight">.</span>
          </h2>
          <p className="text-lg text-white/80">
            {t('description')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/marketplace" 
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-highlight text-highlight-foreground font-semibold hover:bg-highlight/90 transition-colors"
          >
            {t('cta_projects')}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link 
            href="/empresas" 
            className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
          >
            {t('cta_register')}
          </Link>
        </div>
      </div>
    </section>
  );
}
