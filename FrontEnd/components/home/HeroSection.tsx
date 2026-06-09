import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin, DollarSign } from 'lucide-react';

export default function HeroSection() {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative overflow-hidden bg-secondary text-secondary-foreground py-20 lg:py-32">
      {/* Background patterns could go here, simulating the FwdGeoBackdrop */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {/* Placeholder for geometry background */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Abstract lines representing the geo backdrop in the image */}
        </svg>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        {/* Left Column: Copy */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h2 className="text-highlight font-bold tracking-wider text-sm uppercase">
              {t('eyebrow')}
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-white">
              {t('title')}<span className="text-highlight">.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto lg:mx-0">
              {t('description')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
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
              {t('cta_company')}
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Card */}
        <div className="flex-1 w-full max-w-lg">
          <div className="bg-surface rounded-xl p-6 shadow-elevated text-ink-strong">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-magenta"></div>
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <div className="w-3 h-3 rounded-full bg-success"></div>
              </div>
            </div>
            
            <p className="text-magenta font-bold text-xs uppercase mb-2">{t('card_eyebrow')}</p>
            <h3 className="text-2xl font-bold font-heading mb-1">{t('card_title')}</h3>
            <p className="text-ink-muted mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-ink-subtle rounded flex items-center justify-center text-xs text-white">E</span>
              {t('card_company')}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'].map(tech => (
                <span key={tech} className="bg-canvas px-3 py-1 rounded-full text-sm border border-border">
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
              <div className="flex gap-6 text-sm text-ink-muted">
                <div>
                  <div className="flex items-center gap-1 mb-1"><Clock className="w-4 h-4" /> {t('card_duration')}</div>
                  <strong className="text-ink-strong">{t('card_duration_val')}</strong>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1"><MapPin className="w-4 h-4" /> {t('card_modality')}</div>
                  <strong className="text-ink-strong">{t('card_modality_val')}</strong>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1"><DollarSign className="w-4 h-4" /> {t('card_budget')}</div>
                  <strong className="text-ink-strong">{t('card_budget_val')}</strong>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 border-accent text-accent font-bold text-xl relative">
                92%
                <span className="text-[10px] text-ink-muted absolute -bottom-5">{t('card_match')}</span>
              </div>
            </div>

            <Link href="#" className="flex items-center justify-between text-primary font-medium hover:underline">
              {t('card_link')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
