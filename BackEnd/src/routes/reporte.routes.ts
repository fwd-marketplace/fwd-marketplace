import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { crearReporte } from "../controllers/reporte.controller";

const router = Router();

// Crear un reporte sobre un mensaje (cualquier participante autenticado del chat).
router.post("/", authenticate, asyncHandler(crearReporte));

export default router;
