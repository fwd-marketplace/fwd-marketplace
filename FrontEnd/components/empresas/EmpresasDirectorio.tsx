"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, FolderKanban } from "lucide-react";
import type { EmpresaDirectorio } from "@/lib/api/types";

/** Iniciales (máx 2) para el avatar de una empresa sin logo. */
function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Directorio de empresas/emprendedores con proyectos publicados. Cada tarjeta enlaza al perfil
 * público de la empresa y lista sus proyectos (que llevan al detalle en el marketplace).
 */
export function EmpresasDirectorio({ empresas }: { empresas: EmpresaDirectorio[] }) {
  const t = useTranslations("empresas_directorio");
  const locale = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink-strong">
          {t("title")}
          <span className="text-primary" aria-hidden="true">.</span>
        </h1>
        <p className="mt-1 font-body text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      {empresas.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-soft">
          <p className="font-body text-sm text-ink-muted">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {empresas.map((empresa) => {
            const nombre = empresa.nombre_comercial ?? t("sin_nombre");
            return (
              <div
                key={empresa.id}
                className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  {empresa.url_logo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- logo remoto (Cloudinary); no se usa next/image por config de dominios
                    <img
                      src={empresa.url_logo}
                      alt={nombre}
                      className="size-12 shrink-0 rounded-xl border border-border object-cover"
                    />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary/15 font-heading text-sm font-bold text-secondary">
                      {iniciales(nombre)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate font-heading text-lg font-bold text-ink-strong">{nombre}</h2>
                    <span className="font-body text-xs font-semibold uppercase tracking-wider text-primary">
                      {t(`tipo.${empresa.tipo}`)}
                    </span>
                  </div>
                </div>

                {empresa.descripcion && (
                  <p className="mt-3 line-clamp-2 font-body text-sm text-ink-muted">{empresa.descripcion}</p>
                )}

                <div className="mt-4 space-y-2">
                  <p className="font-body text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    {t("projects_count", { count: empresa.proyectos.length })}
                  </p>
                  <ul className="space-y-1.5">
                    {empresa.proyectos.slice(0, 3).map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/${locale}/marketplace/${p.id}`}
                          className="flex items-center gap-1.5 font-body text-sm text-ink transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-primary"
                        >
                          <FolderKanban className="size-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
                          <span className="truncate">{p.titulo}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/${locale}/empresa/${empresa.id}`}
                  className="mt-5 inline-flex items-center gap-1.5 self-start rounded-full border border-border px-4 py-2 font-body text-sm font-semibold text-ink-strong transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-primary/40 hover:text-primary"
                >
                  {t("view_profile")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
