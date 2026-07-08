/**
 * Lógica pura de presentación de la compensación (pago total declarado por proyecto).
 * Sin dependencias de React ni del API: se puede testear en aislamiento.
 */

/** Rango permitido de compensación por proyecto (USD). Coincide con el BackEnd. */
export const COMPENSACION_MIN = 50;
export const COMPENSACION_MAX = 10_000;

/** Formatea un monto a "$1,500 USD" (mismo formato que usa el BackEnd en las notificaciones). */
export function formatCompensacion(amount: number, moneda = "USD"): string {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${moneda}`;
}

/** Monedas soportadas para ingresar/mostrar la tarifa de la cotización. */
export type Moneda = "USD" | "CRC";

/** Símbolo de cada moneda (₡ es un símbolo de moneda, no un emoji). */
export const SIMBOLO_MONEDA: Record<Moneda, string> = { USD: "$", CRC: "₡" };

/**
 * Formatea un monto con el símbolo de la moneda y, opcionalmente, su código:
 * "$1,500 USD" / "₡105,000 CRC" (con código) o "$1,500" / "₡105,000" (sin código).
 */
export function formatMonto(amount: number, moneda: Moneda = "USD", conCodigo = true): string {
  const numero = amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return conCodigo ? `${SIMBOLO_MONEDA[moneda]}${numero} ${moneda}` : `${SIMBOLO_MONEDA[moneda]}${numero}`;
}

/** Buckets de precio para filtrar el marketplace (min inclusivo, max exclusivo). */
export type CompensacionBucket = "low" | "mid" | "high";

export const COMPENSACION_BUCKETS: Record<CompensacionBucket, { min: number; max: number }> = {
  low: { min: 0, max: 500 },
  mid: { min: 500, max: 2000 },
  high: { min: 2000, max: Number.POSITIVE_INFINITY },
};

/** True si el monto cae dentro del bucket dado. Un monto nulo nunca entra en ningún bucket. */
export function isInCompensacionBucket(
  amount: number | null | undefined,
  bucket: CompensacionBucket,
): boolean {
  if (amount == null) return false;
  const range = COMPENSACION_BUCKETS[bucket];
  return amount >= range.min && amount < range.max;
}

/** Margen para no marcar como "actualizado" el seteo inicial de compensación al crear+publicar. */
const COMPENSACION_UPDATE_BUFFER_MS = 60_000;

/**
 * Devuelve `compensacion_actualizada_en` SOLO si el precio se cambió de forma real después de
 * publicar (no en el instante de creación, donde ambas fechas coinciden). Sirve para mostrarle al
 * junior "compensación actualizada el X" como señal de transparencia. `null` si no aplica.
 */
export function compensacionUpdatedAfterPublish(
  actualizadaEn: string | null | undefined,
  fechaPublicacion: string | null | undefined,
): string | null {
  if (!actualizadaEn || !fechaPublicacion) return null;
  const updated = new Date(actualizadaEn).getTime();
  const published = new Date(fechaPublicacion).getTime();
  if (!Number.isFinite(updated) || !Number.isFinite(published)) return null;
  return updated - published > COMPENSACION_UPDATE_BUFFER_MS ? actualizadaEn : null;
}
