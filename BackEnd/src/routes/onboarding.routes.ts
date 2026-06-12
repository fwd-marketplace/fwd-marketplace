import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  onboardJuniorController,
  onboardEmpresaController,
  onboardEmprendedorController,
} from "../controllers/onboarding.controller";

const router = Router();

// Todas requieren sesión: el perfil se crea en nombre del usuario autenticado.
router.post("/junior", authenticate, asyncHandler(onboardJuniorController));
router.post("/empresa", authenticate, asyncHandler(onboardEmpresaController));
router.post("/emprendedor", authenticate, asyncHandler(onboardEmprendedorController));

export default router;
