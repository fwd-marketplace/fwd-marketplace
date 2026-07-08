import { Router } from "express";
import { rateLimit } from "../middlewares/rateLimit.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { verificarEgresadoController } from "../controllers/egresado.controller";

const router = Router();

const MINUTE = 60_000;

// Consulta pública previa al registro: se limita por IP para que nadie use el endpoint
// para tantear cédulas en masa contra el registro de egresados.
const verificarLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  max: 20,
  message: "Demasiadas verificaciones. Esperá unos minutos e intentá de nuevo.",
});

router.post("/verificar", verificarLimiter, asyncHandler(verificarEgresadoController));

export default router;
