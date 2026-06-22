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
    <section id="como-funciona" className="py-24 bg-canvas text-ink">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="text-center mb-16 space-y-4">
          <p className="text-secondary font-bold text-sm tracking-widest uppercase">{t('eyebrow')}</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-ink-strong">
            {t('title')}<span className="text-primary">.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center md:items-start text-center md:text-left rounded-2xl border border-secondary/20 bg-secondary/5 p-8 shadow-soft transition-shadow duration-[var(--duration-base)] ease-[var(--ease-out)] hover:shadow-md"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl font-heading font-light text-secondary">{step.num}</span>
                  <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-secondary">{step.title}</h3>
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
