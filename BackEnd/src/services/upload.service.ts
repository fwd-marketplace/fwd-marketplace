import { getCloudinary } from "../config/cloudinary";
import { ApiError } from "../utils/ApiError";

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
