import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import { ApiError } from "../utils/ApiError";

let configured = false;

export function getCloudinary() {
  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(500, "Cloudinary no está configurado en el servidor");
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}
