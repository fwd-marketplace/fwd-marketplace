import { useTranslations } from 'next-intl';
import { User, Search, Send } from 'lucide-react';

export default function HowItWorksSection() {
  const t = useTranslations('landing.how_it_works');

  const steps = [
    {
      num: '01',
      icon: User,
      title: t('step1_title'),
      desc: t('step1_desc')
    },
    {
      num: '02',
      icon: Search,
      title: t('step2_title'),
      desc: t('step2_desc')
    },
    {
      num: '03',
      icon: Send,
      title: t('step3_title'),
      desc: t('step3_desc')
    }
  ];

  return (
    <section className="py-24 bg-canvas text-ink">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 space-y-4">
          <p className="text-secondary font-bold text-sm tracking-widest uppercase">{t('eyebrow')}</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-ink-strong">
            {t('title')}<span className="text-primary">.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-border-strong -z-10"></div>
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl font-heading font-light text-secondary">{step.num}</span>
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-ink-strong">{step.title}</h3>
                <p className="text-ink-muted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
