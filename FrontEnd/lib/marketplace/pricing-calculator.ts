/**
 * Calculadora de cotización de una propuesta (contraoferta del junior).
 *
 * Lógica PURA de cálculo: sin React ni llamadas al API, se testea en aislamiento (igual
 * criterio que `compensation.ts`). Estima un monto en USD a partir de las variables que
 * declara el junior al cotizar el proyecto:
 *
 *   - Alcance: horas estimadas, o semanas × horas por semana.
 *   - Complejidad: baja / media / alta.
 *   - Stack / skills / herramientas requeridas (a más herramientas especializadas, más premium).
 *   - Tipo de entregable: cantidad de funcionalidades a construir.
 *   - Tarifa base por hora (rango de mercado junior) y modalidad (remoto / híbrido / presencial).
 *   - IVA (13 % Costa Rica), aplicado al final si el junior lo incluye.
 *
 * El resultado se acota al mismo rango que la compensación del proyecto (COMPENSACION_MIN..MAX)
 * para que la contraoferta sea consistente con lo que el BackEnd acepta.
 */

import { COMPENSACION_MIN, COMPENSACION_MAX } from "./compensation";

// ── Dominios cerrados (coinciden con los <select> del formulario) ───────────────
export type Complejidad = "baja" | "media" | "alta";
export type Modalidad = "remoto" | "hibrido" | "presencial";
/** Cómo declara el junior el alcance: en horas directas o en semanas de trabajo. */
export type ModoAlcance = "horas" | "semanas";
/** Tamaño (complejidad) de una funcionalidad individual del proyecto. */
export type TamanoFuncionalidad = "muy_pequena" | "pequena" | "media" | "grande";

// ── Constantes de mercado (junior, Costa Rica) ──────────────────────────────────
/** Rango de referencia de la tarifa por hora del junior (USD). */
export const TARIFA_HORA_MIN = 5;
export const TARIFA_HORA_MAX = 30;
export const TARIFA_HORA_DEFAULT = 12;

/** Horas de trabajo por semana asumidas cuando el alcance se declara en semanas (junior part-time). */
export const HORAS_POR_SEMANA_DEFAULT = 20;

/** Orden de presentación de los tamaños de funcionalidad (de menor a mayor esfuerzo). */
export const TAMANOS_FUNCIONALIDAD: TamanoFuncionalidad[] = ["muy_pequena", "pequena", "media", "grande"];

/** Horas de trabajo estimadas por cada funcionalidad según su tamaño/complejidad. */
export const HORAS_POR_TAMANO_FUNCIONALIDAD: Record<TamanoFuncionalidad, number> = {
  muy_pequena: 1,
  pequena: 3,
  media: 6,
  grande: 12,
};

/** Multiplicador de esfuerzo según la complejidad del proyecto. */
export const COMPLEJIDAD_FACTOR: Record<Complejidad, number> = {
  baja: 1,
  media: 1.3,
  alta: 1.7,
};

/** Multiplicador según la modalidad (presencial cuesta más por traslados/tiempo). */
export const MODALIDAD_FACTOR: Record<Modalidad, number> = {
  remoto: 1,
  hibrido: 1.08,
  presencial: 1.15,
};

/** Premium por cada skill/herramienta especializada requerida, con tope. */
export const UPLIFT_POR_SKILL = 0.025;
export const UPLIFT_SKILL_MAX = 0.25;

/**
 * Tecnologías seleccionables para declarar el stack del proyecto. Se muestran como pastillas
 * en la calculadora; la cantidad seleccionada alimenta `cantidadSkills` del cálculo.
 */
export const STACK_TECNOLOGICO_OPCIONES = [
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Express",
  "Python",
  "Django",
  "Java",
  "PHP",
  "Laravel",
  ".NET",
  "Go",
  "React Native",
  "Flutter",
  "Tailwind CSS",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Supabase",
  "Firebase",
  "GraphQL",
  "REST API",
  "Docker",
  "AWS",
  "Git",
  "Figma",
] as const;

/** IVA de Costa Rica. */
export const IVA_RATE = 0.13;

// ── Entrada / salida ────────────────────────────────────────────────────────────
export interface PricingInput {
  modoAlcance: ModoAlcance;
  /** Horas totales estimadas (cuando `modoAlcance === "horas"`). */
  horasEstimadas?: number;
  /** Semanas de trabajo (cuando `modoAlcance === "semanas"`). */
  semanas?: number;
  /** Horas por semana (cuando el alcance se declara en semanas). Default HORAS_POR_SEMANA_DEFAULT. */
  horasPorSemana?: number;
  complejidad: Complejidad;
  /** Cantidad de skills/herramientas requeridas por el proyecto. */
  cantidadSkills: number;
  /** Cantidad de funcionalidades a construir, agrupadas por su tamaño/complejidad. */
  funcionalidadesPorTamano: Record<TamanoFuncionalidad, number>;
  tarifaHora: number;
  modalidad: Modalidad;
  aplicaIva: boolean;
}

export interface PricingBreakdown {
  /** Horas del alcance base (horas directas, o semanas × horas por semana). */
  horasBase: number;
  /** Horas agregadas por las funcionalidades declaradas. */
  horasFuncionalidades: number;
  /** Horas totales tras aplicar complejidad y modalidad. */
  horasAjustadas: number;
  /** Costo del alcance base (horas base × tarifa, sin ajustes de complejidad/modalidad). */
  costoAlcance: number;
  /** Costo de las funcionalidades (horas de funcionalidades × tarifa, sin ajustes). */
  costoFuncionalidades: number;
  /** Monto que agrega el factor de complejidad sobre el costo base sin ajustes. */
  ajusteComplejidad: number;
  /** Monto que agrega el factor de modalidad sobre el costo ya ajustado por complejidad. */
  ajusteModalidad: number;
  /** horasAjustadas × tarifa, antes del premium de stack. */
  subtotal: number;
  /** Premium en USD por las herramientas especializadas requeridas. */
  upliftStack: number;
  /** subtotal + upliftStack (redondeado), antes de IVA. */
  neto: number;
  /** Monto de IVA (0 si el junior no lo incluye). */
  iva: number;
  /** Monto final acotado al rango de compensación permitido. Es el `monto_propuesto`. */
  total: number;
  /** True si el total crudo cayó fuera del rango y fue acotado. */
  fueAcotado: boolean;
}

// ── Helpers puros ───────────────────────────────────────────────────────────────
/** Convierte a un número finito >= 0 (defensa contra NaN, negativos y no-números). */
function toNonNegative(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return 0;
  return value;
}

/** Acota un monto al rango [COMPENSACION_MIN, COMPENSACION_MAX]. */
function clampToRange(amount: number): number {
  return Math.min(COMPENSACION_MAX, Math.max(COMPENSACION_MIN, amount));
}

/**
 * Calcula el desglose de la cotización a partir de las variables declaradas.
 * Es determinista y no lanza: normaliza entradas inválidas a 0 y acota el total al rango.
 */
export function calcularCotizacion(input: PricingInput): PricingBreakdown {
  const horasBase =
    input.modoAlcance === "semanas"
      ? toNonNegative(input.semanas) *
        (toNonNegative(input.horasPorSemana) || HORAS_POR_SEMANA_DEFAULT)
      : toNonNegative(input.horasEstimadas);

  const horasFuncionalidades = TAMANOS_FUNCIONALIDAD.reduce(
    (horas, tamano) =>
      horas + toNonNegative(input.funcionalidadesPorTamano?.[tamano]) * HORAS_POR_TAMANO_FUNCIONALIDAD[tamano],
    0,
  );

  const complejidadFactor = COMPLEJIDAD_FACTOR[input.complejidad];
  const modalidadFactor = MODALIDAD_FACTOR[input.modalidad];

  const horasAjustadas =
    (horasBase + horasFuncionalidades) * complejidadFactor * modalidadFactor;

  const tarifaHora = toNonNegative(input.tarifaHora);
  const subtotal = horasAjustadas * tarifaHora;

  // Costo atribuido a cada apartado (reconcilia: alcance + funcionalidades + ajustes = subtotal).
  const costoAlcance = horasBase * tarifaHora;
  const costoFuncionalidades = horasFuncionalidades * tarifaHora;
  const costoBaseSinAjustes = costoAlcance + costoFuncionalidades;
  const ajusteComplejidad = costoBaseSinAjustes * (complejidadFactor - 1);
  const ajusteModalidad = costoBaseSinAjustes * complejidadFactor * (modalidadFactor - 1);

  const upliftPct = Math.min(
    toNonNegative(input.cantidadSkills) * UPLIFT_POR_SKILL,
    UPLIFT_SKILL_MAX,
  );
  const upliftStack = subtotal * upliftPct;

  const neto = Math.round(subtotal + upliftStack);
  const iva = input.aplicaIva ? Math.round(neto * IVA_RATE) : 0;
  const totalCrudo = neto + iva;
  const total = clampToRange(totalCrudo);

  return {
    horasBase,
    horasFuncionalidades,
    horasAjustadas: Math.round(horasAjustadas * 100) / 100,
    costoAlcance: Math.round(costoAlcance),
    costoFuncionalidades: Math.round(costoFuncionalidades),
    ajusteComplejidad: Math.round(ajusteComplejidad),
    ajusteModalidad: Math.round(ajusteModalidad),
    subtotal: Math.round(subtotal),
    upliftStack: Math.round(upliftStack),
    neto,
    iva,
    total,
    fueAcotado: total !== totalCrudo,
  };
}

/** True si la cotización tiene alcance y tarifa suficientes para producir un monto real. */
export function esCotizacionValida(input: PricingInput): boolean {
  const horasBase =
    input.modoAlcance === "semanas" ? toNonNegative(input.semanas) : toNonNegative(input.horasEstimadas);
  const totalFuncionalidades = TAMANOS_FUNCIONALIDAD.reduce(
    (total, tamano) => total + toNonNegative(input.funcionalidadesPorTamano?.[tamano]),
    0,
  );
  const alcance = horasBase + totalFuncionalidades;
  return alcance > 0 && toNonNegative(input.tarifaHora) > 0;
}
