import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { listMine } from "../controllers/invitacion.controller";

const router = Router();

// Invitaciones que recibió el estudiante autenticado (empresas interesadas).
router.get("/mias", authenticate, asyncHandler(listMine));

export default router;
