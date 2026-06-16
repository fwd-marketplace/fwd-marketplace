import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { getMe, updateMe } from "../controllers/perfil.controller";

const router = Router();

// El usuario ve y edita su propio perfil (junior: estudiante, empresa/emprendedor: empresario).
router.get("/", authenticate, asyncHandler(getMe));
router.patch("/", authenticate, asyncHandler(updateMe));

export default router;
