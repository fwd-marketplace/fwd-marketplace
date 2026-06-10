import { useTranslations } from 'next-intl';
import { GraduationCap, Building2, CheckCircle2 } from 'lucide-react';

export default function ValuePropositionSection() {
  const t = useTranslations('landing.value_prop');

  const TALENT_ITEMS = [
    t('talents_items.0'),
    t('talents_items.1'),
    t('talents_items.2'),
    t('talents_items.3'),
  ];

  const COMPANY_ITEMS = [
    t('companies_items.0'),
    t('companies_items.1'),
    t('companies_items.2'),
    t('companies_items.3'),
  ];

  return (
    <section className="border-y border-border bg-secondary/5 py-20">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:gap-24">

          {/* Talent Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-ink-strong">
                {t('talents_title')}
              </h3>
            </div>
            <ul className="space-y-4">
              {TALENT_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
                  <span className="text-ink">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Companies Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Building2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-ink-strong">
                {t('companies_title')}
              </h3>
            </div>
            <ul className="space-y-4">
              {COMPANY_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
                  <span className="text-ink">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
