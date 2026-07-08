import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { rateLimit } from "../middlewares/rateLimit.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  asistenteProyecto,
  chatProyecto,
  generarPropuesta,
  mejorarMensaje,
  sugerirStack,
  sugerirCompensacion,
  sugerirCotizacion,
} from "../controllers/ai.controller";

const MINUTE = 60 * 1000;

/**
 * Cupo por usuario (no por IP): las llamadas a IA son caras, así que se limita
 * cuántas puede hacer cada empresa por minuto. Cae a la IP si no hubiera usuario.
 * `authenticate` corre antes, así que `req.user` ya está disponible aquí.
 */
const aiLimiter = rateLimit({
  windowMs: MINUTE,
  max: 20,
  message: "Estás usando el asistente muy seguido. Esperá un momento e intentá de nuevo.",
  keyResolver: (req) => req.user?.id ?? req.ip ?? "unknown",
});

const router = Router();

router.post("/asistente-proyecto", authenticate, aiLimiter, asyncHandler(asistenteProyecto));
router.post("/chat-proyecto/:id", authenticate, aiLimiter, asyncHandler(chatProyecto));
router.post("/mejorar-mensaje", authenticate, aiLimiter, asyncHandler(mejorarMensaje));
router.post("/generar-propuesta", authenticate, aiLimiter, asyncHandler(generarPropuesta));
router.post("/sugerir-stack", authenticate, aiLimiter, asyncHandler(sugerirStack));
router.post("/sugerir-compensacion", authenticate, aiLimiter, asyncHandler(sugerirCompensacion));
router.post("/sugerir-cotizacion", authenticate, aiLimiter, asyncHandler(sugerirCotizacion));

export default router;
