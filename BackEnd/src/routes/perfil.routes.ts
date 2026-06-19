import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { getMe, updateMe, updateAvatar, uploadLogo, removeLogo, updatePreferenciasNotificacion } from "../controllers/perfil.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", authenticate, asyncHandler(getMe));

router.patch("/", authenticate, asyncHandler(updateMe));

router.post("/avatar", authenticate, upload.single("file"), asyncHandler(updateAvatar));
router.post("/logo", authenticate, upload.single("file"), asyncHandler(uploadLogo));
router.delete("/logo", authenticate, asyncHandler(removeLogo));
router.patch("/preferencias-notificacion", authenticate, asyncHandler(updatePreferenciasNotificacion));

export default router;
