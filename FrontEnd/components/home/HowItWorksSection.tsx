'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User, Search, Send, FileText, Inbox, CheckCircle2 } from 'lucide-react';

type Audience = 'juniors' | 'empresas';

export default function HowItWorksSection() {
  const t = useTranslations('landing.how_it_works');
  const [audience, setAudience] = useState<Audience>('juniors');

  const stepsByAudience: Record<Audience, { num: string; icon: typeof User; title: string; desc: string }[]> = {
    juniors: [
      { num: '01', icon: User, title: t('step1_title'), desc: t('step1_desc') },
      { num: '02', icon: Search, title: t('step2_title'), desc: t('step2_desc') },
      { num: '03', icon: Send, title: t('step3_title'), desc: t('step3_desc') },
    ],
    empresas: [
      { num: '01', icon: FileText, title: t('empresa_step1_title'), desc: t('empresa_step1_desc') },
      { num: '02', icon: Inbox, title: t('empresa_step2_title'), desc: t('empresa_step2_desc') },
      { num: '03', icon: CheckCircle2, title: t('empresa_step3_title'), desc: t('empresa_step3_desc') },
    ],
  };

  const steps = stepsByAudience[audience];

  const tabs: { id: Audience; label: string }[] = [
    { id: 'juniors', label: t('audience_juniors') },
    { id: 'empresas', label: t('audience_empresas') },
  ];

  return (
    <section id="como-funciona" className="py-24 bg-canvas text-ink">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="text-center mb-10 space-y-4">
          <p className="text-secondary dark:text-accent font-bold text-sm tracking-widest uppercase">{t('eyebrow')}</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-ink-strong">
            {t('title')}<span className="text-primary">.</span>
          </h2>
        </div>

        <div
          role="tablist"
          aria-label={t('eyebrow')}
          className="mx-auto mb-12 flex w-fit items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-soft"
        >
          {tabs.map((tab) => {
            const isActive = audience === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setAudience(tab.id)}
                className={[
                  'rounded-full px-5 py-2 font-body text-sm font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-ink-muted hover:text-ink-strong',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={`${audience}-${index}`}
                className="flex flex-col items-center md:items-start text-center md:text-left rounded-2xl border border-secondary/20 bg-secondary/5 p-8 shadow-soft transition-shadow duration-[var(--duration-base)] ease-[var(--ease-out)] hover:shadow-md dark:border-border dark:bg-surface"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl font-heading font-light text-secondary dark:text-ink-subtle">{step.num}</span>
                  <div className="w-12 h-12 rounded-full bg-secondary dark:bg-primary text-white flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-secondary dark:text-ink-strong">{step.title}</h3>
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
