import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadDocumento } from "../controllers/upload.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.post("/documento", authenticate, upload.single("file"), asyncHandler(uploadDocumento));

export default router;
