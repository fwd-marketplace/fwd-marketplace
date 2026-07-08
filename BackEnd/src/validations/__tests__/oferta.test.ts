import { describe, it, expect } from "vitest";
import { CreateOfertaSchema, DecideOfertaSchema } from "../oferta";

describe("CreateOfertaSchema", () => {
  it("acepta una propuesta con texto y enlace de documentación", () => {
    // El esquema exige adjuntar un prototipo o un enlace de documentación (refine).
    expect(
      CreateOfertaSchema.safeParse({
        propuesta: "Me interesa este proyecto",
        documentacion_url: "https://docs.com",
      }).success,
    ).toBe(true);
  });

  it("rechaza una propuesta sin prototipo ni documentación", () => {
    expect(CreateOfertaSchema.safeParse({ propuesta: "Me interesa este proyecto" }).success).toBe(false);
  });

  it("rechaza una propuesta vacía", () => {
    expect(CreateOfertaSchema.safeParse({ propuesta: "", prototipo_url: "https://demo.com" }).success).toBe(false);
  });

  it("acepta un prototipo_url válido", () => {
    const result = CreateOfertaSchema.safeParse({
      propuesta: "Hola",
      prototipo_url: "https://demo.com",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un prototipo_url inválido", () => {
    expect(CreateOfertaSchema.safeParse({ propuesta: "Hola", prototipo_url: "x" }).success).toBe(false);
  });
});

describe("DecideOfertaSchema", () => {
  it("acepta accion 'aceptar'", () => {
    expect(DecideOfertaSchema.safeParse({ accion: "aceptar" }).success).toBe(true);
  });

  it("acepta accion 'rechazar'", () => {
    expect(DecideOfertaSchema.safeParse({ accion: "rechazar" }).success).toBe(true);
  });

  it("rechaza una accion desconocida", () => {
    expect(DecideOfertaSchema.safeParse({ accion: "tal_vez" }).success).toBe(false);
  });
});
