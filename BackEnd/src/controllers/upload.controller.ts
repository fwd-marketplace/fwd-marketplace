import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { uploadDocument } from "../services/upload.service";

const ALLOWED_MIMETYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE_MB = 10;

export async function uploadDocumento(req: Request, res: Response) {
  if (!req.file) {
    throw new ApiError(400, "No se recibió ningún archivo");
  }
  if (!ALLOWED_MIMETYPES.includes(req.file.mimetype)) {
    throw new ApiError(400, "Solo se permiten archivos PDF o Word (.pdf, .doc, .docx)");
  }
  if (req.file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new ApiError(400, `El archivo no puede superar ${MAX_SIZE_MB} MB`);
  }
  const url = await uploadDocument(req.file.buffer, "ofertas/documentos", req.file.originalname);
  res.status(201).json({ url });
}
