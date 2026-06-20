import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { getMe, updateMe, updateAvatar, uploadLogo, removeLogo, updatePreferenciasNotificacion } from "../controllers/perfil.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  // Solo imágenes: rechaza cualquier otro tipo con un 400 claro antes de subir a Cloudinary.
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new ApiError(400, "El archivo debe ser una imagen (PNG, JPG o WEBP)"));
  },
});

router.get("/", authenticate, asyncHandler(getMe));

router.patch("/", authenticate, asyncHandler(updateMe));

router.post("/avatar", authenticate, upload.single("file"), asyncHandler(updateAvatar));
router.post("/logo", authenticate, upload.single("file"), asyncHandler(uploadLogo));
router.delete("/logo", authenticate, asyncHandler(removeLogo));
router.patch("/preferencias-notificacion", authenticate, asyncHandler(updatePreferenciasNotificacion));

export default router;
