import { describe, it, expect } from "vitest";
import {
  calcularCotizacion,
  esCotizacionValida,
  HORAS_POR_SEMANA_DEFAULT,
  HORAS_POR_FUNCIONALIDAD,
  IVA_RATE,
  UPLIFT_SKILL_MAX,
  type PricingInput,
} from "../pricing-calculator";
import { COMPENSACION_MIN, COMPENSACION_MAX } from "../compensation";

/** Entrada base sencilla: 10 h, complejidad baja, sin skills, sin funcionalidades, tarifa $10, remoto, sin IVA. */
function baseInput(overrides: Partial<PricingInput> = {}): PricingInput {
  return {
    modoAlcance: "horas",
    horasEstimadas: 10,
    complejidad: "baja",
    cantidadSkills: 0,
    cantidadFuncionalidades: 0,
    tarifaHora: 10,
    modalidad: "remoto",
    aplicaIva: false,
    ...overrides,
  };
}

describe("calcularCotizacion", () => {
  it("caso base: horas × tarifa sin ajustes = subtotal directo", () => {
    const r = calcularCotizacion(baseInput());
    expect(r.horasBase).toBe(10);
    expect(r.horasAjustadas).toBe(10);
    expect(r.subtotal).toBe(100);
    expect(r.upliftStack).toBe(0);
    expect(r.iva).toBe(0);
    expect(r.total).toBe(100);
    expect(r.fueAcotado).toBe(false);
  });

  it("modo semanas usa las horas por semana por defecto", () => {
    const r = calcularCotizacion(baseInput({ modoAlcance: "semanas", semanas: 2 }));
    expect(r.horasBase).toBe(2 * HORAS_POR_SEMANA_DEFAULT);
  });

  it("modo semanas respeta horas por semana explícitas", () => {
    const r = calcularCotizacion(baseInput({ modoAlcance: "semanas", semanas: 3, horasPorSemana: 10 }));
    expect(r.horasBase).toBe(30);
  });

  it("cada funcionalidad agrega horas fijas", () => {
    const r = calcularCotizacion(baseInput({ cantidadFuncionalidades: 4 }));
    expect(r.horasFuncionalidades).toBe(4 * HORAS_POR_FUNCIONALIDAD);
    // (10 + 12) × $10 = 220
    expect(r.subtotal).toBe(220);
  });

  it("la complejidad alta multiplica el esfuerzo", () => {
    const baja = calcularCotizacion(baseInput({ complejidad: "baja" }));
    const alta = calcularCotizacion(baseInput({ complejidad: "alta" }));
    expect(alta.subtotal).toBeGreaterThan(baja.subtotal);
    // 10 h × 1.7 × $10 = 170
    expect(alta.subtotal).toBe(170);
  });

  it("la modalidad presencial encarece frente a remoto", () => {
    const remoto = calcularCotizacion(baseInput({ modalidad: "remoto" }));
    const presencial = calcularCotizacion(baseInput({ modalidad: "presencial" }));
    expect(presencial.subtotal).toBeGreaterThan(remoto.subtotal);
  });

  it("el premium por skills tiene tope", () => {
    const r = calcularCotizacion(baseInput({ cantidadSkills: 100, tarifaHora: 10, horasEstimadas: 10 }));
    // subtotal 100, uplift tope 25% → 25
    expect(r.upliftStack).toBe(Math.round(100 * UPLIFT_SKILL_MAX));
  });

  it("aplica IVA al neto cuando corresponde", () => {
    const sinIva = calcularCotizacion(baseInput({ horasEstimadas: 50, tarifaHora: 10 }));
    const conIva = calcularCotizacion(baseInput({ horasEstimadas: 50, tarifaHora: 10, aplicaIva: true }));
    expect(sinIva.iva).toBe(0);
    expect(conIva.iva).toBe(Math.round(conIva.neto * IVA_RATE));
    expect(conIva.total).toBe(conIva.neto + conIva.iva);
  });

  it("acota el total por debajo del mínimo permitido", () => {
    const r = calcularCotizacion(baseInput({ horasEstimadas: 1, tarifaHora: 5 }));
    expect(r.total).toBe(COMPENSACION_MIN);
    expect(r.fueAcotado).toBe(true);
  });

  it("acota el total por encima del máximo permitido", () => {
    const r = calcularCotizacion(baseInput({ horasEstimadas: 100000, tarifaHora: 30 }));
    expect(r.total).toBe(COMPENSACION_MAX);
    expect(r.fueAcotado).toBe(true);
  });

  it("normaliza entradas inválidas (NaN / negativos) a cero", () => {
    const r = calcularCotizacion(baseInput({ horasEstimadas: Number.NaN, cantidadFuncionalidades: -5, tarifaHora: -10 }));
    expect(r.subtotal).toBe(0);
    expect(r.total).toBe(COMPENSACION_MIN); // acotado desde 0
  });
});

describe("esCotizacionValida", () => {
  it("es falsa sin alcance", () => {
    expect(esCotizacionValida(baseInput({ horasEstimadas: 0, cantidadFuncionalidades: 0 }))).toBe(false);
  });

  it("es falsa sin tarifa", () => {
    expect(esCotizacionValida(baseInput({ tarifaHora: 0 }))).toBe(false);
  });

  it("es verdadera con alcance y tarifa", () => {
    expect(esCotizacionValida(baseInput())).toBe(true);
  });
});
