import { describe, it, expect } from "vitest";
import {
  formatCompensacion,
  formatMonto,
  isInCompensacionBucket,
  compensacionUpdatedAfterPublish,
} from "../compensation";

describe("formatCompensacion", () => {
  it("formatea con separador de miles y moneda USD por defecto", () => {
    expect(formatCompensacion(1500)).toBe("$1,500 USD");
  });

  it("no muestra decimales", () => {
    expect(formatCompensacion(999.99)).toBe("$1,000 USD");
  });

  it("respeta la moneda recibida", () => {
    expect(formatCompensacion(50, "USD")).toBe("$50 USD");
  });
});

describe("formatMonto", () => {
  it("formatea USD con símbolo y código", () => {
    expect(formatMonto(1500, "USD")).toBe("$1,500 USD");
  });

  it("formatea colones con el símbolo ₡", () => {
    expect(formatMonto(105000, "CRC")).toBe("₡105,000 CRC");
  });

  it("omite el código cuando se pide sin código", () => {
    expect(formatMonto(6300, "CRC", false)).toBe("₡6,300");
  });
});

describe("isInCompensacionBucket", () => {
  it("ubica montos bajos en 'low' (max exclusivo)", () => {
    expect(isInCompensacionBucket(499, "low")).toBe(true);
    expect(isInCompensacionBucket(500, "low")).toBe(false);
  });

  it("ubica el límite inferior en el bucket siguiente", () => {
    expect(isInCompensacionBucket(500, "mid")).toBe(true);
    expect(isInCompensacionBucket(2000, "mid")).toBe(false);
    expect(isInCompensacionBucket(2000, "high")).toBe(true);
  });

  it("un monto nulo no entra en ningún bucket", () => {
    expect(isInCompensacionBucket(null, "low")).toBe(false);
    expect(isInCompensacionBucket(undefined, "high")).toBe(false);
  });
});

describe("compensacionUpdatedAfterPublish", () => {
  const publish = "2026-07-01T10:00:00.000Z";

  it("devuelve null cuando la actualización coincide con la publicación (seteo inicial)", () => {
    expect(compensacionUpdatedAfterPublish("2026-07-01T10:00:10.000Z", publish)).toBe(null);
  });

  it("devuelve la fecha cuando el precio se cambió claramente después de publicar", () => {
    const later = "2026-07-03T15:00:00.000Z";
    expect(compensacionUpdatedAfterPublish(later, publish)).toBe(later);
  });

  it("devuelve null si falta alguna de las fechas", () => {
    expect(compensacionUpdatedAfterPublish(null, publish)).toBe(null);
    expect(compensacionUpdatedAfterPublish("2026-07-03T15:00:00.000Z", null)).toBe(null);
  });
});
