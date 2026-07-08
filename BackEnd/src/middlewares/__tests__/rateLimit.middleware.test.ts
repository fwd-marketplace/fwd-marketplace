import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { rateLimit } from "../rateLimit.middleware";

/** Crea un req/res falsos para una IP, capturando los headers que se setean. */
function makeReqRes(ip: string) {
  const headers: Record<string, string> = {};
  const req = { ip, socket: { remoteAddress: ip } } as unknown as Request;
  const res = {
    setHeader: (k: string, v: string) => {
      headers[k] = v;
    },
  } as unknown as Response;
  return { req, res, headers };
}

/** Ejecuta el middleware una vez y devuelve el error pasado a `next` (o undefined). */
function call(
  mw: (req: Request, res: Response, next: NextFunction) => void,
  req: Request,
  res: Response,
): { error: unknown } {
  let result: { error: unknown } = { error: undefined };
  const next: NextFunction = ((err?: unknown) => {
    result = { error: err };
  }) as NextFunction;
  mw(req, res, next);
  return result;
}

describe("rateLimit", () => {
  it("deja pasar mientras no se supere el máximo", () => {
    const mw = rateLimit({ windowMs: 1000, max: 3 });
    const { req, res } = makeReqRes("1.1.1.1");

    for (let i = 0; i < 3; i++) {
      expect(call(mw, req, res).error).toBeUndefined();
    }
  });

  it("responde 429 (next con ApiError) y setea Retry-After al exceder", () => {
    const mw = rateLimit({ windowMs: 1000, max: 2 });
    const { req, res, headers } = makeReqRes("2.2.2.2");

    call(mw, req, res);
    call(mw, req, res);
    const { error } = call(mw, req, res); // 3.ª excede el max=2

    expect(error).toMatchObject({ statusCode: 429 });
    expect(headers["Retry-After"]).toBeDefined();
  });

  it("cuenta cada IP de forma independiente", () => {
    const mw = rateLimit({ windowMs: 1000, max: 1 });
    const a = makeReqRes("3.3.3.3");
    const b = makeReqRes("4.4.4.4");

    expect(call(mw, a.req, a.res).error).toBeUndefined();
    expect(call(mw, a.req, a.res).error).toMatchObject({ statusCode: 429 });
    // B tiene su propio cupo, no lo afecta el de A.
    expect(call(mw, b.req, b.res).error).toBeUndefined();
  });

  it("reinicia el contador cuando pasa la ventana", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    const mw = rateLimit({ windowMs: 1000, max: 1 });
    const { req, res } = makeReqRes("5.5.5.5");

    expect(call(mw, req, res).error).toBeUndefined();
    expect(call(mw, req, res).error).toMatchObject({ statusCode: 429 });

    nowSpy.mockReturnValue(1_000_000 + 1001); // ventana vencida
    expect(call(mw, req, res).error).toBeUndefined();

    nowSpy.mockRestore();
  });
});