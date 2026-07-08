"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Calculator, Check, X } from "lucide-react";
import {
  calcularCotizacion,
  esCotizacionValida,
  TARIFA_HORA_MIN,
  TARIFA_HORA_MAX,
  TARIFA_HORA_DEFAULT,
  HORAS_POR_SEMANA_DEFAULT,
  type Complejidad,
  type Modalidad,
  type ModoAlcance,
} from "@/lib/marketplace/pricing-calculator";
import { COMPENSACION_MIN, COMPENSACION_MAX, formatCompensacion } from "@/lib/marketplace/compensation";

/**
 * Calculadora de cotización de la propuesta (contraoferta del junior). Es un panel que se despliega
 * dentro de "Propuesta N": el junior declara alcance, complejidad, stack, funcionalidades, tarifa y
 * modalidad, y la calculadora estima un monto (con IVA opcional) usando la lógica pura de
 * `lib/marketplace/pricing-calculator`. Al aplicar, el monto sube al formulario como `monto_propuesto`.
 * El cálculo es en vivo (useMemo, sin efectos); la UI solo dispara `onApply` / `onCancel`.
 */

const CONTROL_CLS =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 font-body text-sm text-ink outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] focus:border-primary";

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Botones de selección segmentada para un enum (complejidad, modalidad, modo de alcance). */
function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={
              "rounded-full border px-3 py-1 font-body text-xs font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] " +
              (active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface text-ink-muted hover:border-primary/40 hover:text-ink")
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function PricingCalculator({
  initialMonto,
  onApply,
  onCancel,
}: {
  initialMonto?: number | null;
  onApply: (monto: number) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("gestion_page");

  const [modoAlcance, setModoAlcance] = useState<ModoAlcance>("horas");
  const [horasEstimadas, setHorasEstimadas] = useState("");
  const [semanas, setSemanas] = useState("");
  const [horasPorSemana, setHorasPorSemana] = useState(String(HORAS_POR_SEMANA_DEFAULT));
  const [complejidad, setComplejidad] = useState<Complejidad>("media");
  const [cantidadSkills, setCantidadSkills] = useState("");
  const [cantidadFuncionalidades, setCantidadFuncionalidades] = useState("");
  const [tarifaHora, setTarifaHora] = useState(String(TARIFA_HORA_DEFAULT));
  const [modalidad, setModalidad] = useState<Modalidad>("remoto");
  const [aplicaIva, setAplicaIva] = useState(false);

  const pricingInput = useMemo(
    () => ({
      modoAlcance,
      horasEstimadas: toNumber(horasEstimadas),
      semanas: toNumber(semanas),
      horasPorSemana: toNumber(horasPorSemana),
      complejidad,
      cantidadSkills: toNumber(cantidadSkills),
      cantidadFuncionalidades: toNumber(cantidadFuncionalidades),
      tarifaHora: toNumber(tarifaHora),
      modalidad,
      aplicaIva,
    }),
    [modoAlcance, horasEstimadas, semanas, horasPorSemana, complejidad, cantidadSkills, cantidadFuncionalidades, tarifaHora, modalidad, aplicaIva],
  );

  const valida = esCotizacionValida(pricingInput);
  const breakdown = useMemo(() => calcularCotizacion(pricingInput), [pricingInput]);
  const rangeVars = { min: COMPENSACION_MIN, max: COMPENSACION_MAX };

  return (
    <div className="rounded-2xl border border-border bg-surface-sunken p-4 shadow-soft">
      {/* Encabezado */}
      <div className="mb-3 flex items-start gap-2">
        <Calculator className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h4 className="font-heading text-sm font-bold text-ink-strong">{t("calc_titulo")}</h4>
          <p className="mt-0.5 font-body text-xs text-ink-muted">{t("calc_subtitulo")}</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Alcance */}
        <div>
          <label className="mb-1.5 block font-body text-xs font-semibold text-ink">{t("calc_alcance_label")}</label>
          <SegmentedControl
            ariaLabel={t("calc_alcance_label")}
            value={modoAlcance}
            onChange={setModoAlcance}
            options={[
              { value: "horas", label: t("calc_modo_horas") },
              { value: "semanas", label: t("calc_modo_semanas") },
            ]}
          />
          {modoAlcance === "horas" ? (
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={horasEstimadas}
              onChange={(e) => setHorasEstimadas(e.target.value)}
              placeholder={t("calc_horas_label")}
              aria-label={t("calc_horas_label")}
              className={CONTROL_CLS + " mt-2"}
            />
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={semanas}
                onChange={(e) => setSemanas(e.target.value)}
                placeholder={t("calc_semanas_label")}
                aria-label={t("calc_semanas_label")}
                className={CONTROL_CLS}
              />
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={horasPorSemana}
                onChange={(e) => setHorasPorSemana(e.target.value)}
                placeholder={t("calc_horas_semana_label")}
                aria-label={t("calc_horas_semana_label")}
                className={CONTROL_CLS}
              />
            </div>
          )}
        </div>

        {/* Complejidad */}
        <div>
          <label className="mb-1.5 block font-body text-xs font-semibold text-ink">{t("calc_complejidad_label")}</label>
          <SegmentedControl
            ariaLabel={t("calc_complejidad_label")}
            value={complejidad}
            onChange={setComplejidad}
            options={[
              { value: "baja", label: t("calc_complejidad_baja") },
              { value: "media", label: t("calc_complejidad_media") },
              { value: "alta", label: t("calc_complejidad_alta") },
            ]}
          />
        </div>

        {/* Skills y funcionalidades */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1.5 block font-body text-xs font-semibold text-ink">{t("calc_skills_label")}</label>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={cantidadSkills}
              onChange={(e) => setCantidadSkills(e.target.value)}
              placeholder="0"
              aria-label={t("calc_skills_label")}
              className={CONTROL_CLS}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-body text-xs font-semibold text-ink">{t("calc_funcionalidades_label")}</label>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={cantidadFuncionalidades}
              onChange={(e) => setCantidadFuncionalidades(e.target.value)}
              placeholder="0"
              aria-label={t("calc_funcionalidades_label")}
              className={CONTROL_CLS}
            />
          </div>
        </div>

        {/* Tarifa */}
        <div>
          <label className="mb-1.5 block font-body text-xs font-semibold text-ink">{t("calc_tarifa_label")}</label>
          <input
            type="number"
            min={TARIFA_HORA_MIN}
            max={TARIFA_HORA_MAX}
            inputMode="decimal"
            value={tarifaHora}
            onChange={(e) => setTarifaHora(e.target.value)}
            aria-label={t("calc_tarifa_label")}
            className={CONTROL_CLS}
          />
          <p className="mt-1 font-body text-[11px] text-ink-muted">
            {t("calc_tarifa_hint", { min: TARIFA_HORA_MIN, max: TARIFA_HORA_MAX })}
          </p>
        </div>

        {/* Modalidad */}
        <div>
          <label className="mb-1.5 block font-body text-xs font-semibold text-ink">{t("calc_modalidad_label")}</label>
          <SegmentedControl
            ariaLabel={t("calc_modalidad_label")}
            value={modalidad}
            onChange={setModalidad}
            options={[
              { value: "remoto", label: t("calc_modalidad_remoto") },
              { value: "hibrido", label: t("calc_modalidad_hibrido") },
              { value: "presencial", label: t("calc_modalidad_presencial") },
            ]}
          />
        </div>

        {/* IVA */}
        <label className="flex cursor-pointer items-center gap-2 font-body text-xs font-semibold text-ink">
          <input
            type="checkbox"
            checked={aplicaIva}
            onChange={(e) => setAplicaIva(e.target.checked)}
            className="size-4 rounded border-border text-primary focus:ring-primary"
          />
          {t("calc_iva_label")}
        </label>
      </div>

      {/* Desglose y total */}
      <div className="mt-4 rounded-xl border border-border bg-surface p-3">
        {valida ? (
          <>
            <p className="mb-2 font-body text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              {t("calc_desglose_titulo")}
            </p>
            <dl className="space-y-1 font-body text-xs text-ink-muted">
              <div className="flex justify-between">
                <dt>{t("calc_desglose_horas")}</dt>
                <dd className="text-ink">{breakdown.horasAjustadas}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t("calc_desglose_subtotal")}</dt>
                <dd className="text-ink">{formatCompensacion(breakdown.subtotal)}</dd>
              </div>
              {breakdown.upliftStack > 0 && (
                <div className="flex justify-between">
                  <dt>{t("calc_desglose_stack")}</dt>
                  <dd className="text-ink">+{formatCompensacion(breakdown.upliftStack)}</dd>
                </div>
              )}
              {breakdown.iva > 0 && (
                <>
                  <div className="flex justify-between">
                    <dt>{t("calc_desglose_neto")}</dt>
                    <dd className="text-ink">{formatCompensacion(breakdown.neto)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{t("calc_desglose_iva")}</dt>
                    <dd className="text-ink">+{formatCompensacion(breakdown.iva)}</dd>
                  </div>
                </>
              )}
            </dl>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="font-body text-xs font-semibold text-ink">{t("calc_total_label")}</span>
              <span className="font-heading text-lg font-black text-primary">{formatCompensacion(breakdown.total)}</span>
            </div>
            {breakdown.fueAcotado && (
              <p className="mt-1.5 font-body text-[11px] text-warning">{t("calc_acotado_aviso", rangeVars)}</p>
            )}
          </>
        ) : (
          <p className="font-body text-xs text-ink-muted">{t("calc_invalida")}</p>
        )}
      </div>

      {/* Acciones */}
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5 font-body text-xs font-semibold text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:text-ink"
        >
          <X className="size-3.5" aria-hidden="true" /> {t("calc_cancelar")}
        </button>
        <button
          type="button"
          disabled={!valida}
          onClick={() => onApply(breakdown.total)}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 font-body text-xs font-semibold text-white transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check className="size-3.5" aria-hidden="true" /> {t("calc_aplicar")}
        </button>
      </div>

      {/* initialMonto se usa como referencia externa; el panel arranca vacío para recotizar. */}
      {typeof initialMonto === "number" && (
        <p className="mt-2 text-right font-body text-[11px] text-ink-muted">
          {t("calc_monto_actual")}: {formatCompensacion(initialMonto)}
        </p>
      )}
    </div>
  );
}
