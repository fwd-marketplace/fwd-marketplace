import { describe, it, expect, beforeEach, vi } from "vitest";
import { EventEmitter } from "node:events";
import type { Request, Response, NextFunction } from "express";

vi.mock("../../utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { requestLogger } from "../requestLogger.middleware";
import { logger } from "../../utils/logger";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requestLogger", () => {
  it("llama a next inmediatamente", () => {
    const req = { method: "GET", originalUrl: "/api/health" } as Request;
    const res = new EventEmitter() as unknown as Response;
    const next = vi.fn() as NextFunction;

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("loguea método, ruta y status cuando la respuesta termina", () => {
    const req = { method: "POST", originalUrl: "/api/users/login" } as Request;
    const emitter = new EventEmitter();
    const res = emitter as unknown as Response;
    (res as unknown as { statusCode: number }).statusCode = 201;

    requestLogger(req, res, (() => undefined) as NextFunction);
    expect(logger.info).not.toHaveBeenCalled(); // aún no terminó

    emitter.emit("finish");

    expect(logger.info).toHaveBeenCalledWith(
      "request",
      expect.objectContaining({ method: "POST", path: "/api/users/login", status: 201 }),
    );
  });
});