"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, X, Loader2, AlertCircle, ArrowUpRight } from "lucide-react";

/**
 * Vista previa embebida (iframe) del prototipo desplegado de una propuesta.
 * Se reutiliza tanto en la vista de la empresa (postulaciones recibidas) como en
 * la del estudiante (mis postulaciones). El iframe va con `sandbox` y
 * `referrerPolicy` por seguridad, y degrada a un enlace si el sitio bloquea el
 * embed (X-Frame-Options / CSP). La privacidad de quién ve la propuesta la
 * resuelve el RLS de `oferta`, no este componente.
 */
export function PrototipoPreview({ url, title }: { url: string; title: string }) {
  const t = useTranslations("prototipo_preview");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 font-body text-sm font-semibold text-primary transition-colors duration-[var(--duration-fast)] hover:bg-primary/20"
      >
        <Eye className="size-4" aria-hidden="true" />
        {t("button")}
      </button>
      {isOpen && <PreviewModal url={url} title={title} onClose={() => setIsOpen(false)} />}
    </>
  );
}

function PreviewModal({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  const t = useTranslations("prototipo_preview");
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-strong/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-surface shadow-elevated"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("modal_title")}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-heading text-lg font-bold text-ink-strong">
            {t("modal_title")}: {title}
          </h2>
          <div className="flex items-center gap-4">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-body text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              {t("open_in_new_tab")} <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
              aria-label={t("close")}
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="relative min-h-[50vh] flex-grow bg-surface-sunken md:h-[70vh]">
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertCircle className="size-10 text-magenta" aria-hidden="true" />
              <p className="max-w-md font-body text-sm text-ink-muted">{t("iframe_error")}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 rounded-full bg-primary px-6 py-2 font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t("open_in_new_tab")}
              </a>
            </div>
          )}
          <iframe
            src={url}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            referrerPolicy="no-referrer"
            className={`size-full border-0 transition-opacity duration-300 ${
              status === "loading" ? "opacity-0" : "opacity-100"
            }`}
            title={`${t("modal_title")}: ${title}`}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
          />
        </div>
      </div>
    </div>
  );
}
