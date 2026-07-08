/**
 * Locale BCP-47 para las APIs de `Intl` (fechas/horas) según el idioma activo de la app.
 * Preserva el formato de Costa Rica en español (`es-CR`) y usa `en-US` en inglés, para que
 * las fechas respeten el idioma seleccionado en vez de quedar fijas en español.
 */
export function intlLocale(locale: string): string {
  return locale === "en" ? "en-US" : "es-CR";
}
