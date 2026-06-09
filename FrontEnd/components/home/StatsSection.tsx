import { useTranslations } from 'next-intl';
import { Users, Briefcase, Building, Smile } from 'lucide-react';

export default function StatsSection() {
  const t = useTranslations('landing.stats');

  const stats = [
    {
      icon: Users,
      val: t('stat1_val'),
      label: t('stat1_label')
    },
    {
      icon: Briefcase,
      val: t('stat2_val'),
      label: t('stat2_label')
    },
    {
      icon: Building,
      val: t('stat3_val'),
      label: t('stat3_label')
    },
    {
      icon: Smile,
      val: t('stat4_val'),
      label: t('stat4_label')
    }
  ];

  return (
    <section className="py-16 bg-canvas text-ink border-b border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center space-y-3">
                <Icon className="w-8 h-8 text-secondary" strokeWidth={1.5} />
                <div className="text-4xl font-heading font-bold text-ink-strong">{stat.val}</div>
                <div className="text-ink-muted text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
