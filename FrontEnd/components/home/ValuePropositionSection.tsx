import { useTranslations } from 'next-intl';
import { GraduationCap, Building2, CheckCircle2 } from 'lucide-react';

export default function ValuePropositionSection() {
  const t = useTranslations('landing.value_prop');

  // Need to read arrays correctly, next-intl requires map or specific handling for arrays. 
  // For simplicity, we can retrieve them by index or read the raw messages, but standard next-intl usage is slightly different.
  // Using explicit keys or a generic mapping since we defined them as arrays in JSON.
  
  const talentsItems = [0, 1, 2, 3];
  const companiesItems = [0, 1, 2, 3];

  return (
    <section className="bg-secondary/5 py-20 border-y border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Talent Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-ink-strong">
                {t('talents_title')}
              </h3>
            </div>
            <ul className="space-y-4">
              {talentsItems.map((index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-ink">{t(`talents_items.${index}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Companies Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-ink-strong">
                {t('companies_title')}
              </h3>
            </div>
            <ul className="space-y-4">
              {companiesItems.map((index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-ink">{t(`companies_items.${index}`)}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
