import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { updateMe, updateAvatar, uploadLogo } from "../controllers/perfil.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.patch("/", authenticate, asyncHandler(updateMe));

router.post("/avatar", authenticate, upload.single("file"), asyncHandler(updateAvatar));
router.post("/logo", authenticate, upload.single("file"), asyncHandler(uploadLogo));

export default router;
