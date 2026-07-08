import { getCloudinary } from "../config/cloudinary";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

export function uploadDocument(buffer: Buffer, folder: string, originalName: string): Promise<string> {
  const cloudinary = getCloudinary();
  const publicId = `${folder}/${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "raw", public_id: publicId },
      (error, result) => {
        if (error || !result) {
          reject(new ApiError(502, error?.message ?? "No se pudo subir el documento"));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export function uploadImage(buffer: Buffer, folder: string): Promise<string> {
  const cloudinary = getCloudinary();

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(new ApiError(502, error?.message ?? "No se pudo subir la imagen"));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

/**
 * Extrae el `public_id` de una `secure_url` de Cloudinary (formato
 * `.../image/upload/[transform/][v<version>/]<public_id>.<ext>`). Nuestras subidas
 * no aplican transformaciones, así que basta con quitar la versión y la extensión.
 */
function extractPublicId(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  let path = (url.slice(idx + marker.length).split("?")[0] ?? "").replace(/^v\d+\//, "");
  const lastSlash = path.lastIndexOf("/");
  const lastDot = path.lastIndexOf(".");
  if (lastDot > lastSlash) path = path.slice(0, lastDot);
  return path || null;
}

/**
 * Borra (best-effort) un asset de Cloudinary a partir de su URL. NO bloquea ni
 * rompe el flujo principal: si falla, solo se registra en el log. Se usa al
 * reemplazar o eliminar avatar/logo para no dejar imágenes huérfanas.
 */
export function destroyImageByUrl(url: string | null | undefined): void {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    const cloudinary = getCloudinary();
    cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch((error: unknown) => {
      logger.warn("cloudinary_destroy_failed", {
        publicId,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  } catch (error) {
    logger.warn("cloudinary_destroy_failed", {
      publicId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
