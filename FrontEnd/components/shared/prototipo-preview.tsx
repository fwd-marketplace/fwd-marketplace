"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowUpRight, Loader2, Monitor, X } from "lucide-react";

/**
 * Vista previa de un prototipo/demo desplegado. Es la MISMA experiencia que la tarjeta del
 * portafolio del junior: una miniatura tipo navegador con captura de la web (mShots de
 * WordPress.com, sin API key, evita el bloqueo de X-Frame-Options de un <iframe> directo) y un
 * botón "Vista previa" que abre un modal con la web en vivo. Se extrajo aquí para reutilizarla en
 * el envío de propuestas (junior) y en la revisión de propuestas (empresa), garantizando que todas
 * se vean y funcionen igual. i18n propio (namespace `prototipo_preview`).
 */

const PREVIEW_SCREENSHOT_BASE = "https://s.wordpress.com/mshots/v1/";
const PREVIEW_SCREENSHOT_WIDTH = 1200;

/** Construye la URL de captura, o null si la URL no es http(s) válida. */
export function buildScreenshotUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return `${PREVIEW_SCREENSHOT_BASE}${encodeURIComponent(url)}?w=${PREVIEW_SCREENSHOT_WIDTH}`;
  } catch {
    return null;
  }
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url || "—";
  }
}

// ── Modal con la web en vivo ────────────────────────────────────────────────────
function PreviewModal({ url, title, onClose }: { url: string; title?: string | undefined; onClose: () => void }) {
  const t = useTranslations("prototipo_preview");
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="truncate font-heading text-lg font-bold text-ink-strong">
            {t("modal_title")}{title ? `: ${title}` : ""}
          </h2>
          <div className="flex items-center gap-4">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-body text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              {t("open_new_tab")} <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
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
                className="mt-2 rounded-full bg-primary px-6 py-2 font-body font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t("open_new_tab")}
              </a>
            </div>
          )}
          <iframe
            src={url}
            className={`size-full border-0 transition-opacity duration-300 ${status === "loading" ? "opacity-0" : "opacity-100"}`}
            title={title ? `${t("modal_title")}: ${title}` : t("modal_title")}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
          />
        </div>
      </div>
    </div>
  );
}

// ── Widget de vista previa (miniatura + botón + modal) ──────────────────────────
export function PrototipoPreview({
  url,
  title,
  className,
}: {
  url: string;
  title?: string | undefined;
  className?: string | undefined;
}) {
  const t = useTranslations("prototipo_preview");
  const [previewFailed, setPreviewFailed] = useState(false);
  const [open, setOpen] = useState(false);

  const screenshotUrl = buildScreenshotUrl(url);
  const hostname = hostnameOf(url);
  const hasValidUrl = screenshotUrl !== null;

  return (
    <div className={className}>
      <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        {/* Chrome del navegador */}
        <div className="flex items-center gap-2 border-b border-border bg-surface-sunken px-3 py-2">
          <div className="flex shrink-0 gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" aria-hidden="true" />
            <span className="size-2.5 rounded-full bg-[#FFBD2E]" aria-hidden="true" />
            <span className="size-2.5 rounded-full bg-[#28C840]" aria-hidden="true" />
          </div>
          <div className="flex-1 truncate rounded border border-border/50 bg-canvas px-2 py-0.5 font-body text-[11px] text-ink-muted">
            {hasValidUrl ? hostname : t("sin_url")}
          </div>
        </div>
        {/* Área de captura (degradado + grilla + icono de fondo; captura superpuesta) */}
        <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-tr from-primary/8 to-secondary/8">
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 28px, var(--border) 28px, var(--border) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, var(--border) 28px, var(--border) 29px)" }}
          />
          <Monitor className="size-12 text-primary/30" aria-hidden="true" />
          {hasValidUrl && screenshotUrl && !previewFailed && (
            // eslint-disable-next-line @next/next/no-img-element -- captura externa (mShots), no optimizable por next/image
            <img
              src={screenshotUrl}
              alt={title ?? hostname}
              loading="lazy"
              onError={() => setPreviewFailed(true)}
              className="absolute inset-0 size-full object-cover object-top"
            />
          )}
        </div>
        {/* Acciones */}
        <div className="flex items-center gap-2 border-t border-border/50 bg-surface px-4 py-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={!hasValidUrl}
            className="flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-1.5 font-body text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Monitor className="size-3.5" aria-hidden="true" /> {t("preview_btn")}
          </button>
          {hasValidUrl && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-surface-sunken px-3 py-1.5 font-body text-xs font-semibold text-ink transition-colors hover:bg-border/30"
            >
              {t("open_btn")} <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
      {open && hasValidUrl && (
        <PreviewModal url={url} title={title} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
