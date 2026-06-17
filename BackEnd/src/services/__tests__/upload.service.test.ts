import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Estado del mock de Cloudinary: el resultado/error que el `upload_stream`
 * pasará a su callback, y las opciones capturadas para verificar folder/tipo.
 */
const { state } = vi.hoisted(() => ({
  state: {
    result: { secure_url: "" } as { secure_url: string } | null,
    error: null as unknown,
    lastOptions: null as Record<string, unknown> | null,
  },
}));

vi.mock("../../config/cloudinary", () => ({
  getCloudinary: () => ({
    uploader: {
      upload_stream: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: { secure_url: string } | null) => void,
      ) => {
        state.lastOptions = options;
        return {
          end: (_buffer: Buffer) => callback(state.error, state.result),
        };
      },
    },
  }),
}));

import { uploadImage } from "../upload.service";

const SECURE_URL = "https://res.cloudinary.com/demo/image/upload/avatar.jpg";

beforeEach(() => {
  state.result = { secure_url: SECURE_URL };
  state.error = null;
  state.lastOptions = null;
});

describe("uploadImage", () => {
  it("sube la imagen y devuelve la secure_url", async () => {
    const url = await uploadImage(Buffer.from("img"), "fwd/avatars");
    expect(url).toBe(SECURE_URL);
    expect(state.lastOptions).toMatchObject({ folder: "fwd/avatars", resource_type: "image" });
  });

  it("rechaza (502) si Cloudinary devuelve error", async () => {
    state.error = { message: "rate limit" };
    state.result = null;
    await expect(uploadImage(Buffer.from("img"), "fwd/avatars")).rejects.toMatchObject({
      statusCode: 502,
    });
  });

  it("rechaza (502) si no hay result ni error", async () => {
    state.error = null;
    state.result = null;
    await expect(uploadImage(Buffer.from("img"), "fwd/avatars")).rejects.toMatchObject({
      statusCode: 502,
    });
  });
});