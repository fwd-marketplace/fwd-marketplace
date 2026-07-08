'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Compass, X } from 'lucide-react';

const STORAGE_KEY = 'fwd_llamado_toast_shown';

export function LlamadoToast() {
  const t = useTranslations('bienvenida.llamado_toast');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Espera a que terminen las animaciones de entrada de la pagina
    const showTimer = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const dismissTimer = setTimeout(dismiss, 6000);
    return () => clearTimeout(dismissTimer);
  }, [visible]);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, '1');
  }

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-start gap-4 rounded-2xl border border-primary/30 bg-surface px-5 py-4 shadow-[0_8px_32px_rgba(10,108,185,0.22)] max-w-sm"
      style={{ animation: 'llamadoSlideUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
      <style>{`
        @keyframes llamadoSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_18px_rgba(10,108,185,0.55)]">
        <Compass className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm leading-tight text-ink-strong">
          {t('title')}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          {t('desc')}
        </p>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label={t('dismiss')}
        className="shrink-0 rounded-full p-1 text-ink-subtle transition-colors duration-[var(--duration-fast)] hover:bg-canvas hover:text-ink"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
