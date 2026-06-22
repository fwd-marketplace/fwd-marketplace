'use client';

import React, { useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CosmosBackground } from '@/components/ui/cosmos-background';

/** Forma de cada sección en messages (terms.sections). */
type Section = {
  title: string;
  paragraphs?: string[];
  items?: string[];
  note?: string;
};

export function TerminosYCondiciones() {
  const t = useTranslations('terms');
  // t.raw devuelve el array crudo de secciones (la forma la garantiza el JSON).
  const sections = t.raw('sections') as Section[];

  useEffect(() => {
    const beforePrint = () => {
      document.querySelectorAll('details').forEach((d) => d.setAttribute('open', ''));
    };
    const afterPrint = () => {
      document.querySelectorAll('details').forEach((d) => d.removeAttribute('open'));
    };
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-secondary font-sans pb-20 pt-32 px-6 md:px-10 lg:px-16 overflow-hidden print:bg-transparent print:p-0 print:m-0 print:min-h-0 print:block">
      <style>{`
        @media print {
          header, nav, [data-navbar] { display: none !important; }
          body { background: white !important; color: black !important; margin: 0; padding: 0; }
          /* Mostrar el contenido de los acordeones y neutralizar las animaciones
             (animate-in arranca en opacity:0, por eso el PDF salía sin texto). */
          details > :not(summary) {
            display: block !important;
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
          details { border-bottom: none !important; }
        }
      `}</style>
      <div className="print:hidden">
        <CosmosBackground showMoon />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl bg-surface rounded-xl p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.2)] border border-white/10 print:bg-transparent print:shadow-none print:border-none print:p-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-ink-strong">
            {t('title')}
            <span className="text-primary">.</span>
          </h1>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full border-border-strong hover:bg-canvas print:hidden"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4" />
            {t('download')}
          </Button>
        </div>

        <div className="space-y-8 text-ink leading-relaxed">
          {sections.map((section, i) => (
            <details
              key={i}
              className="group border-b border-white/10 py-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between font-heading text-xl md:text-2xl font-bold text-ink-strong transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                {section.title}
                <span className="shrink-0 ml-4 transition-transform duration-300 group-open:-rotate-180 print:hidden">
                  <ChevronDown className="h-6 w-6 text-primary" />
                </span>
              </summary>
              <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
                {section.paragraphs?.map((p, j) => (
                  <p key={j} className={j > 0 ? 'mt-4' : undefined}>
                    {p}
                  </p>
                ))}
                {section.items && section.items.length > 0 && (
                  <ul className="list-disc pl-6 mt-2 space-y-2 text-ink-muted">
                    {section.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.note && (
                  <p className="mt-4 font-medium bg-warning/10 text-warning px-4 py-3 rounded-lg border border-warning/20">
                    {section.note}
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
