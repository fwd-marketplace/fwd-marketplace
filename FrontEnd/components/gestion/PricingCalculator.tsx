"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Calculator, Check, ChevronDown, FileDown, Loader2, Plus, Receipt, Sparkles, Trash2, X } from "lucide-react";
import { suggestCotizacionAction } from "@/lib/actions/ai";
import type { CotizacionSuggestion } from "@/lib/api/types";
import {
  calcularCotizacion,
  esCotizacionValida,
  TARIFA_HORA_MIN,
  TARIFA_HORA_MAX,
  TARIFA_HORA_DEFAULT,
  HORAS_POR_SEMANA_DEFAULT,
  STACK_TECNOLOGICO_OPCIONES,
  TAMANOS_FUNCIONALIDAD,
  COMPLEJIDAD_FACTOR,
  MODALIDAD_FACTOR,
  TIPO_CAMBIO_CRC_POR_USD,
  type Complejidad,
  type Modalidad,
  type ModoAlcance,
  type TamanoFuncionalidad,
  type PricingBreakdown,
} from "@/lib/marketplace/pricing-calculator";
import { COMPENSACION_MIN, COMPENSACION_MAX, formatMonto, type Moneda } from "@/lib/marketplace/compensation";

/**
 * Calculadora de cotización de la propuesta (contraoferta del junior). Es un panel que se despliega
 * dentro de "Propuesta N": el junior declara alcance, complejidad, stack, funcionalidades, tarifa y
 * modalidad, y la calculadora estima un monto (con IVA opcional) usando la lógica pura de
 * `lib/marketplace/pricing-calculator`. Al aplicar, el monto sube al formulario como `monto_propuesto`.
 * El cálculo es en vivo (useMemo, sin efectos); la UI solo dispara `onApply` / `onCancel`.
 */

/** Control compacto y denso usado en toda la calculadora (inputs y selects). */
const CONTROL_CLS_SM =
  "rounded-lg border border-border bg-surface px-2 py-1 font-body text-xs text-ink outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] focus:border-primary";

/**
 * Al imprimir, oculta todos los hijos directos del body salvo el resumen (`.pdf-print-root`),
 * que se monta con un portal como hijo directo del body para fluir desde el inicio de la página.
 */
const PRINT_STYLE = `
@media print {
  body > *:not(.pdf-print-root) { display: none !important; }
  .pdf-print-root { display: block !important; }
  @page { margin: 16mm; }
}
`;

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Una funcionalidad (o grupo de ellas) declarada por el junior: nombre opcional, cantidad y complejidad. */
interface FuncionalidadDeclarada {
  id: number;
  nombre: string;
  cantidad: string;
  complejidad: TamanoFuncionalidad;
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

/**
 * Detalle de cuánto aporta cada apartado de la cotización (alcance, funcionalidades, ajustes por
 * complejidad y modalidad, premium de stack e IVA). Se reutiliza en el panel y en el PDF.
 */
function DesglosePorApartado({
  breakdown,
  factorComplejidad,
  factorModalidad,
  formatear,
  compact,
}: {
  breakdown: PricingBreakdown;
  factorComplejidad: number;
  factorModalidad: number;
  formatear: (montoUsd: number) => string;
  compact?: boolean;
}) {
  const t = useTranslations("gestion_page");
  const lineas = [
    { label: t("calc_desglose_alcance"), monto: breakdown.costoAlcance, mostrar: breakdown.costoAlcance > 0 },
    {
      label: t("calc_desglose_funcionalidades"),
      monto: breakdown.costoFuncionalidades,
      mostrar: breakdown.costoFuncionalidades > 0,
    },
    {
      label: t("calc_desglose_ajuste_complejidad", { factor: factorComplejidad }),
      monto: breakdown.ajusteComplejidad,
      mostrar: breakdown.ajusteComplejidad !== 0,
    },
    {
      label: t("calc_desglose_ajuste_modalidad", { factor: factorModalidad }),
      monto: breakdown.ajusteModalidad,
      mostrar: breakdown.ajusteModalidad !== 0,
    },
    { label: t("calc_desglose_stack"), monto: breakdown.upliftStack, mostrar: breakdown.upliftStack > 0 },
    { label: t("calc_desglose_iva"), monto: breakdown.iva, mostrar: breakdown.iva > 0 },
  ];
  return (
    <dl className={"space-y-1 font-body text-ink-muted " + (compact ? "text-xs" : "text-sm")}>
      {lineas
        .filter((linea) => linea.mostrar)
        .map((linea) => (
          <div key={linea.label} className="flex justify-between gap-4">
            <dt>{linea.label}</dt>
            <dd className="text-ink">{formatear(linea.monto)}</dd>
          </div>
        ))}
    </dl>
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
  const locale = useLocale();

  const [modoAlcance, setModoAlcance] = useState<ModoAlcance>("horas");
  const [horasEstimadas, setHorasEstimadas] = useState("");
  const [semanas, setSemanas] = useState("");
  const [horasPorSemana, setHorasPorSemana] = useState(String(HORAS_POR_SEMANA_DEFAULT));
  const [complejidad, setComplejidad] = useState<Complejidad>("media");
  const [stackSeleccionado, setStackSeleccionado] = useState<string[]>([]);
  const [stackAbierto, setStackAbierto] = useState(false);
  const [funcionalidades, setFuncionalidades] = useState<FuncionalidadDeclarada[]>([]);
  const proximoIdFuncionalidad = useRef(0);
  const [tarifaHora, setTarifaHora] = useState(String(TARIFA_HORA_DEFAULT));
  const [moneda, setMoneda] = useState<Moneda>("USD");
  const [modalidad, setModalidad] = useState<Modalidad>("remoto");
  const [aplicaIva, setAplicaIva] = useState(false);
  const [fechaPdf, setFechaPdf] = useState<string | null>(null);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [montado, setMontado] = useState(false);
  const [desgloseAbierto, setDesgloseAbierto] = useState(false);
  // Autocompletado con IA: descripción del proyecto -> campos del formulario.
  const [iaAbierto, setIaAbierto] = useState(false);
  const [iaDescripcion, setIaDescripcion] = useState("");
  const [iaCargando, setIaCargando] = useState(false);
  const [iaError, setIaError] = useState<string | null>(null);
  const [iaJustificacion, setIaJustificacion] = useState<string | null>(null);

  // El resumen imprimible se monta con un portal en el body; solo existe en el cliente.
  useEffect(() => setMontado(true), []);

  /** Longitud mínima de la descripción que exige el BackEnd (validación de `sugerir-cotizacion`). */
  const IA_DESCRIPCION_MIN = 10;

  /** Vuelca la sugerencia de la IA en el estado del formulario (el cálculo del monto es reactivo). */
  function aplicarSugerenciaIa(sugerencia: CotizacionSuggestion) {
    setModoAlcance(sugerencia.modoAlcance);
    setHorasEstimadas(sugerencia.horasEstimadas > 0 ? String(sugerencia.horasEstimadas) : "");
    setSemanas(sugerencia.semanas > 0 ? String(sugerencia.semanas) : "");
    setHorasPorSemana(String(sugerencia.horasPorSemana || HORAS_POR_SEMANA_DEFAULT));
    setComplejidad(sugerencia.complejidad);

    // El modelo se guía por la lista de stack, pero filtramos por si devuelve algo fuera de ella.
    const stackValido = sugerencia.stack.filter((tecnologia) =>
      (STACK_TECNOLOGICO_OPCIONES as readonly string[]).includes(tecnologia),
    );
    setStackSeleccionado(stackValido);
    if (stackValido.length > 0) setStackAbierto(true);

    setFuncionalidades(
      sugerencia.funcionalidades.map((funcionalidad) => {
        proximoIdFuncionalidad.current += 1;
        return {
          id: proximoIdFuncionalidad.current,
          nombre: funcionalidad.nombre,
          cantidad: String(Math.max(1, funcionalidad.cantidad)),
          complejidad: funcionalidad.tamano,
        };
      }),
    );

    // La tarifa llega en USD; si el usuario está en CRC, se convierte para conservar la moneda elegida.
    const tarifa =
      moneda === "CRC" ? Math.round(sugerencia.tarifaHora * TIPO_CAMBIO_CRC_POR_USD) : sugerencia.tarifaHora;
    setTarifaHora(String(tarifa));
    setModalidad(sugerencia.modalidad);
    setAplicaIva(sugerencia.aplicaIva);

    setIaJustificacion(sugerencia.justificacion || null);
    setDesgloseAbierto(true);
    setIaAbierto(false);
  }

  async function generarConIa() {
    const descripcion = iaDescripcion.trim();
    if (descripcion.length < IA_DESCRIPCION_MIN) {
      setIaError(t("calc_ia_min"));
      return;
    }
    setIaCargando(true);
    setIaError(null);
    const resultado = await suggestCotizacionAction({ descripcion });
    setIaCargando(false);
    if (!resultado.ok) {
      setIaError(resultado.error);
      return;
    }
    aplicarSugerenciaIa(resultado.data);
  }

  function toggleStack(tecnologia: string) {
    setStackSeleccionado((previas) =>
      previas.includes(tecnologia)
        ? previas.filter((actual) => actual !== tecnologia)
        : [...previas, tecnologia],
    );
  }

  function agregarFuncionalidad() {
    proximoIdFuncionalidad.current += 1;
    setFuncionalidades((previas) => [
      ...previas,
      { id: proximoIdFuncionalidad.current, nombre: "", cantidad: "1", complejidad: "media" },
    ]);
  }

  function quitarFuncionalidad(id: number) {
    setFuncionalidades((previas) => previas.filter((funcionalidad) => funcionalidad.id !== id));
  }

  function actualizarFuncionalidad(id: number, cambios: Partial<Omit<FuncionalidadDeclarada, "id">>) {
    setFuncionalidades((previas) =>
      previas.map((funcionalidad) => (funcionalidad.id === id ? { ...funcionalidad, ...cambios } : funcionalidad)),
    );
  }

  // Deriva la cantidad de funcionalidades por complejidad a partir de la lista declarada.
  const funcionalidadesPorTamano = useMemo(() => {
    const conteo: Record<TamanoFuncionalidad, number> = { muy_pequena: 0, pequena: 0, media: 0, grande: 0 };
    for (const funcionalidad of funcionalidades) {
      conteo[funcionalidad.complejidad] += Math.max(0, Math.floor(toNumber(funcionalidad.cantidad)));
    }
    return conteo;
  }, [funcionalidades]);

  const totalFuncionalidades =
    funcionalidadesPorTamano.muy_pequena +
    funcionalidadesPorTamano.pequena +
    funcionalidadesPorTamano.media +
    funcionalidadesPorTamano.grande;

  const pricingInput = useMemo(
    () => ({
      modoAlcance,
      horasEstimadas: toNumber(horasEstimadas),
      semanas: toNumber(semanas),
      horasPorSemana: toNumber(horasPorSemana),
      complejidad,
      cantidadSkills: stackSeleccionado.length,
      funcionalidadesPorTamano,
      tarifaHora: moneda === "CRC" ? toNumber(tarifaHora) / TIPO_CAMBIO_CRC_POR_USD : toNumber(tarifaHora),
      modalidad,
      aplicaIva,
    }),
    [modoAlcance, horasEstimadas, semanas, horasPorSemana, complejidad, stackSeleccionado, funcionalidadesPorTamano, tarifaHora, moneda, modalidad, aplicaIva],
  );

  const valida = esCotizacionValida(pricingInput);
  const breakdown = useMemo(() => calcularCotizacion(pricingInput), [pricingInput]);
  const factorComplejidad = COMPLEJIDAD_FACTOR[complejidad];
  const factorModalidad = MODALIDAD_FACTOR[modalidad];

  // Presentación por moneda: el cálculo es en USD; en CRC se convierte solo para mostrar.
  function mostrarMonto(montoUsd: number): string {
    const monto = moneda === "CRC" ? montoUsd * TIPO_CAMBIO_CRC_POR_USD : montoUsd;
    return formatMonto(monto, moneda);
  }

  // Al cambiar de moneda, convierte la tarifa para conservar la tarifa real (no reinicia el estimado).
  function cambiarMoneda(nueva: Moneda) {
    if (nueva === moneda) return;
    const actual = toNumber(tarifaHora);
    if (actual > 0) {
      const convertida =
        nueva === "CRC" ? actual * TIPO_CAMBIO_CRC_POR_USD : actual / TIPO_CAMBIO_CRC_POR_USD;
      setTarifaHora(String(nueva === "CRC" ? Math.round(convertida) : Math.round(convertida * 100) / 100));
    }
    setMoneda(nueva);
  }

  const rangeVars = { min: mostrarMonto(COMPENSACION_MIN), max: mostrarMonto(COMPENSACION_MAX) };
  const tarifaMinMoneda = moneda === "CRC" ? TARIFA_HORA_MIN * TIPO_CAMBIO_CRC_POR_USD : TARIFA_HORA_MIN;
  const tarifaMaxMoneda = moneda === "CRC" ? TARIFA_HORA_MAX * TIPO_CAMBIO_CRC_POR_USD : TARIFA_HORA_MAX;
  const tarifaHintVars = {
    min: formatMonto(tarifaMinMoneda, moneda, false),
    max: formatMonto(tarifaMaxMoneda, moneda, false),
  };

  // Lanza la impresión (Guardar como PDF) tras pintar la fecha; fuerza tema claro y lo restaura al terminar.
  useEffect(() => {
    if (!imprimiendo) return;
    const html = document.documentElement;
    const eraOscuro = html.classList.contains("dark");
    if (eraOscuro) html.classList.remove("dark");
    const alTerminar = () => {
      if (eraOscuro) html.classList.add("dark");
      setImprimiendo(false);
    };
    window.addEventListener("afterprint", alTerminar, { once: true });
    window.print();
    return () => window.removeEventListener("afterprint", alTerminar);
  }, [imprimiendo]);

  function guardarComoPdf() {
    setFechaPdf(
      new Date().toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }),
    );
    setImprimiendo(true);
  }

  const alcanceResumen =
    modoAlcance === "semanas"
      ? t("calc_pdf_alcance_semanas", {
          semanas: toNumber(semanas),
          horas: toNumber(horasPorSemana) || HORAS_POR_SEMANA_DEFAULT,
        })
      : t("calc_pdf_alcance_horas", { horas: toNumber(horasEstimadas) });

  return (
    <div className="rounded-2xl border border-border bg-surface-sunken p-4 shadow-soft">
      {/* Encabezado */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Calculator className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h4 className="font-heading text-sm font-bold text-ink-strong">{t("calc_titulo")}</h4>
            <p className="mt-0.5 font-body text-xs text-ink-muted">{t("calc_subtitulo")}</p>
          </div>
        </div>
        <button
          type="button"
          aria-expanded={iaAbierto}
          onClick={() => {
            setIaError(null);
            setIaAbierto((abierto) => !abierto);
          }}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/5 px-3 py-1.5 font-body text-xs font-semibold text-secondary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary/10"
        >
          <Sparkles className="size-3.5" aria-hidden="true" /> {t("calc_ia_ayuda")}
        </button>
      </div>

      {/* Panel de autocompletado con IA */}
      {iaAbierto && (
        <div className="mb-3 rounded-xl border border-secondary/30 bg-secondary/5 p-3">
          <label htmlFor="calc-ia-descripcion" className="mb-1.5 block font-body text-xs font-semibold text-ink">
            {t("calc_ia_descripcion_label")}
          </label>
          <textarea
            id="calc-ia-descripcion"
            value={iaDescripcion}
            onChange={(e) => setIaDescripcion(e.target.value)}
            placeholder={t("calc_ia_descripcion_placeholder")}
            rows={3}
            className={CONTROL_CLS_SM + " w-full resize-y"}
          />
          {iaError && <p className="mt-1.5 font-body text-[11px] text-magenta">{iaError}</p>}
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              disabled={iaCargando}
              onClick={generarConIa}
              className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 font-body text-xs font-semibold text-white transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {iaCargando ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-3.5" aria-hidden="true" />
              )}
              {iaCargando ? t("calc_ia_generando") : t("calc_ia_generar")}
            </button>
          </div>
        </div>
      )}

      {iaJustificacion && !iaAbierto && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-secondary/20 bg-secondary/5 p-3">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-secondary" aria-hidden="true" />
          <p className="font-body text-[11px] text-ink-muted">
            <span className="font-semibold text-secondary">{t("calc_ia_nota")}</span> {iaJustificacion}
          </p>
        </div>
      )}

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
              className={CONTROL_CLS_SM + " mt-2 w-28"}
            />
          ) : (
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={semanas}
                onChange={(e) => setSemanas(e.target.value)}
                placeholder={t("calc_semanas_label")}
                aria-label={t("calc_semanas_label")}
                className={CONTROL_CLS_SM + " w-24"}
              />
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={horasPorSemana}
                onChange={(e) => setHorasPorSemana(e.target.value)}
                placeholder={t("calc_horas_semana_label")}
                aria-label={t("calc_horas_semana_label")}
                className={CONTROL_CLS_SM + " w-24"}
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

        {/* Stack tecnológico (desplegable, en pastillas) */}
        <div>
          <button
            type="button"
            onClick={() => setStackAbierto((abierto) => !abierto)}
            aria-expanded={stackAbierto}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-primary/40"
          >
            <span className="font-body text-xs font-semibold text-ink">
              {t("calc_stack_label")}
              {stackSeleccionado.length > 0 && (
                <span className="ml-1.5 font-normal text-ink-muted">
                  {t("calc_stack_seleccionadas", { count: stackSeleccionado.length })}
                </span>
              )}
            </span>
            <ChevronDown
              className={
                "size-4 shrink-0 text-ink-muted transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)] " +
                (stackAbierto ? "rotate-180" : "")
              }
              aria-hidden="true"
            />
          </button>
          {stackAbierto && (
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={t("calc_stack_label")}>
              {STACK_TECNOLOGICO_OPCIONES.map((tecnologia) => {
                const activo = stackSeleccionado.includes(tecnologia);
                return (
                  <button
                    key={tecnologia}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => toggleStack(tecnologia)}
                    className={
                      "rounded-full border px-3 py-1 font-body text-xs font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] " +
                      (activo
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-surface text-ink-muted hover:border-primary/40 hover:text-ink")
                    }
                  >
                    {tecnologia}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Funcionalidades: una por una, con su cantidad y complejidad */}
        <div>
          <label className="mb-1.5 block font-body text-xs font-semibold text-ink">
            {t("calc_funcionalidades_label")}
            {totalFuncionalidades > 0 && (
              <span className="ml-1.5 font-normal text-ink-muted">({totalFuncionalidades})</span>
            )}
          </label>

          {funcionalidades.length === 0 ? (
            <p className="mb-2 font-body text-xs text-ink-muted">{t("calc_funcionalidades_vacio")}</p>
          ) : (
            <div className="mb-2 space-y-1.5">
              {funcionalidades.map((funcionalidad, indice) => (
                <div key={funcionalidad.id} className="rounded-lg border border-border bg-surface p-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={funcionalidad.nombre}
                      onChange={(e) => actualizarFuncionalidad(funcionalidad.id, { nombre: e.target.value })}
                      placeholder={t("calc_funcionalidad_nombre_placeholder", { numero: indice + 1 })}
                      aria-label={t("calc_funcionalidad_nombre_placeholder", { numero: indice + 1 })}
                      className={CONTROL_CLS_SM + " min-w-0 flex-1"}
                    />
                    <button
                      type="button"
                      onClick={() => quitarFuncionalidad(funcionalidad.id)}
                      aria-label={t("calc_funcionalidad_quitar")}
                      className="shrink-0 rounded-lg border border-border p-1.5 text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-magenta/40 hover:text-magenta"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={funcionalidad.cantidad}
                      onChange={(e) => actualizarFuncionalidad(funcionalidad.id, { cantidad: e.target.value })}
                      aria-label={t("calc_funcionalidad_cantidad_label", { numero: indice + 1 })}
                      className={CONTROL_CLS_SM + " w-14 shrink-0 text-center"}
                    />
                    <select
                      value={funcionalidad.complejidad}
                      onChange={(e) =>
                        actualizarFuncionalidad(funcionalidad.id, {
                          complejidad: e.target.value as TamanoFuncionalidad,
                        })
                      }
                      aria-label={t("calc_funcionalidad_complejidad_label", { numero: indice + 1 })}
                      className={CONTROL_CLS_SM + " min-w-0 flex-1"}
                    >
                      {TAMANOS_FUNCIONALIDAD.map((tamano) => (
                        <option key={tamano} value={tamano}>
                          {t(`calc_tamano_${tamano}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={agregarFuncionalidad}
            className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 font-body text-xs font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary/10"
          >
            <Plus className="size-3.5" aria-hidden="true" /> {t("calc_funcionalidad_agregar")}
          </button>
        </div>

        {/* Tarifa */}
        <div>
          <label className="mb-1.5 block font-body text-xs font-semibold text-ink">{t("calc_tarifa_label")}</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={tarifaMinMoneda}
              max={tarifaMaxMoneda}
              inputMode="decimal"
              value={tarifaHora}
              onChange={(e) => setTarifaHora(e.target.value)}
              aria-label={t("calc_tarifa_label")}
              className={CONTROL_CLS_SM + " w-24"}
            />
            <SegmentedControl<Moneda>
              ariaLabel={t("calc_moneda_label")}
              value={moneda}
              onChange={cambiarMoneda}
              options={[
                { value: "USD", label: t("calc_moneda_usd") },
                { value: "CRC", label: t("calc_moneda_crc") },
              ]}
            />
          </div>
          <p className="mt-1 font-body text-[11px] text-ink-muted">{t("calc_tarifa_hint", tarifaHintVars)}</p>
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
                <dd className="text-ink">{mostrarMonto(breakdown.subtotal)}</dd>
              </div>
              {breakdown.upliftStack > 0 && (
                <div className="flex justify-between">
                  <dt>{t("calc_desglose_stack")}</dt>
                  <dd className="text-ink">+{mostrarMonto(breakdown.upliftStack)}</dd>
                </div>
              )}
              {breakdown.iva > 0 && (
                <>
                  <div className="flex justify-between">
                    <dt>{t("calc_desglose_neto")}</dt>
                    <dd className="text-ink">{mostrarMonto(breakdown.neto)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{t("calc_desglose_iva")}</dt>
                    <dd className="text-ink">+{mostrarMonto(breakdown.iva)}</dd>
                  </div>
                </>
              )}
            </dl>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="font-body text-xs font-semibold text-ink">{t("calc_total_label")}</span>
              <span className="font-heading text-lg font-black text-primary">{mostrarMonto(breakdown.total)}</span>
            </div>
            {breakdown.fueAcotado && (
              <p className="mt-1.5 font-body text-[11px] text-warning">{t("calc_acotado_aviso", rangeVars)}</p>
            )}
          </>
        ) : (
          <p className="font-body text-xs text-ink-muted">{t("calc_invalida")}</p>
        )}
      </div>

      {/* Detalle por apartado: se despliega al presionar "Sacar monto" */}
      {desgloseAbierto && valida && (
        <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <p className="mb-2 flex items-center gap-1.5 font-body text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Receipt className="size-3.5" aria-hidden="true" /> {t("calc_desglose_detalle_titulo")}
          </p>
          <DesglosePorApartado
            breakdown={breakdown}
            factorComplejidad={factorComplejidad}
            factorModalidad={factorModalidad}
            formatear={mostrarMonto}
          />
          <div className="mt-2 flex items-center justify-between border-t border-primary/20 pt-2">
            <span className="font-body text-sm font-semibold text-ink">{t("calc_total_label")}</span>
            <span className="font-heading text-xl font-black text-primary">{mostrarMonto(breakdown.total)}</span>
          </div>
          {breakdown.fueAcotado && (
            <p className="mt-1.5 font-body text-[11px] text-warning">{t("calc_acotado_aviso", rangeVars)}</p>
          )}
          <button
            type="button"
            onClick={() => onApply(breakdown.total)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 font-body text-xs font-semibold text-white transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:opacity-90"
          >
            <Check className="size-3.5" aria-hidden="true" /> {t("calc_usar_monto")}
          </button>
        </div>
      )}

      {/* Acciones */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          disabled={!valida}
          onClick={guardarComoPdf}
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 font-body text-xs font-semibold text-ink transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FileDown className="size-3.5" aria-hidden="true" /> {t("calc_guardar_pdf")}
        </button>
        <div className="flex items-center gap-2">
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
            aria-expanded={desgloseAbierto}
            onClick={() => setDesgloseAbierto((abierto) => !abierto)}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 font-body text-xs font-semibold text-white transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Receipt className="size-3.5" aria-hidden="true" /> {t("calc_aplicar")}
          </button>
        </div>
      </div>

      {/* initialMonto se usa como referencia externa; el panel arranca vacío para recotizar. */}
      {typeof initialMonto === "number" && (
        <p className="mt-2 text-right font-body text-[11px] text-ink-muted">
          {t("calc_monto_actual")}: {mostrarMonto(initialMonto)}
        </p>
      )}

      {/* Resumen imprimible: portal al body, oculto en pantalla y visible solo al Guardar como PDF. */}
      <style>{PRINT_STYLE}</style>
      {montado &&
        createPortal(
          <div className="pdf-print-root hidden bg-canvas p-6 text-ink" aria-hidden="true">
        <header className="mb-4 border-b border-border pb-3">
          <h1 className="font-heading text-2xl font-black text-ink-strong">
            {t("calc_pdf_titulo")}
            <span className="text-primary">.</span>
          </h1>
          {fechaPdf && <p className="mt-1 font-body text-sm text-ink-muted">{t("calc_pdf_fecha", { fecha: fechaPdf })}</p>}
        </header>

        <section className="mb-4">
          <h2 className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-ink-muted">
            {t("calc_pdf_parametros")}
          </h2>
          <dl className="space-y-1 font-body text-sm text-ink">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">{t("calc_alcance_label")}</dt>
              <dd className="text-right font-semibold">{alcanceResumen}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">{t("calc_complejidad_label")}</dt>
              <dd className="text-right font-semibold">{t(`calc_complejidad_${complejidad}`)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">{t("calc_tarifa_label")}</dt>
              <dd className="text-right font-semibold">{formatMonto(toNumber(tarifaHora), moneda)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">{t("calc_modalidad_label")}</dt>
              <dd className="text-right font-semibold">{t(`calc_modalidad_${modalidad}`)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">{t("calc_iva_label")}</dt>
              <dd className="text-right font-semibold">{aplicaIva ? t("calc_pdf_si") : t("calc_pdf_no")}</dd>
            </div>
            {stackSeleccionado.length > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{t("calc_stack_label")}</dt>
                <dd className="text-right font-semibold">{stackSeleccionado.join(", ")}</dd>
              </div>
            )}
          </dl>
        </section>

        {funcionalidades.length > 0 && (
          <section className="mb-4">
            <h2 className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-ink-muted">
              {t("calc_funcionalidades_label")} ({totalFuncionalidades})
            </h2>
            <ul className="space-y-1 font-body text-sm text-ink">
              {funcionalidades.map((funcionalidad, indice) => (
                <li key={funcionalidad.id} className="flex justify-between gap-4">
                  <span>
                    {Math.max(0, Math.floor(toNumber(funcionalidad.cantidad)))} ×{" "}
                    {funcionalidad.nombre.trim() || t("calc_pdf_funcionalidad_sin_nombre", { numero: indice + 1 })}
                  </span>
                  <span className="text-right text-ink-muted">{t(`calc_tamano_${funcionalidad.complejidad}`)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-4">
          <h2 className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-ink-muted">
            {t("calc_desglose_detalle_titulo")}
          </h2>
          <DesglosePorApartado
            breakdown={breakdown}
            factorComplejidad={factorComplejidad}
            factorModalidad={factorModalidad}
            formatear={mostrarMonto}
          />
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="font-heading text-base font-bold text-ink-strong">{t("calc_total_label")}</span>
            <span className="font-heading text-2xl font-black text-primary">{mostrarMonto(breakdown.total)}</span>
          </div>
        </section>

            <footer className="border-t border-border pt-3 font-body text-xs text-ink-muted">{t("calc_subtitulo")}</footer>
          </div>,
          document.body,
        )}
    </div>
  );
}
