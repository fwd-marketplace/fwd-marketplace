"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";

/**
 * Traduce un código de error estable del backend (ej. "CEDULA_TAKEN") a texto
 * localizado del namespace `api_errors`. Cae al string crudo si no es un código
 * conocido: así un mensaje que el backend pasa tal cual (ej. de Supabase) o un
 * texto ya traducido por el componente se muestran sin romperse.
 *
 * La función es estable (useCallback) para poder usarla como dependencia de
 * effects/memos sin re-ejecutarlos en cada render.
 */
export function useApiErrorText() {
  const t = useTranslations("api_errors");
  return useCallback(
    (raw: string | null | undefined): string | null => {
      if (!raw) return null;
      return t.has(raw) ? t(raw) : raw;
    },
    [t],
  );
}
