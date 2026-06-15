import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { updateMe } from "../controllers/perfil.controller";

const router = Router();

// El usuario edita su propio perfil (junior: estudiante, empresa/emprendedor: empresario).
router.patch("/", authenticate, asyncHandler(updateMe));

export default router;
