import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { listMine, marcarUnaLeida, marcarTodas } from "../controllers/notificacion.controller";

const router = Router();

// Todas requieren sesion: cada usuario solo ve y marca sus propias notificaciones.
router.get("/", authenticate, asyncHandler(listMine));
// "/leidas" (marcar todas) va antes de "/:id/leida" para que no lo capture la ruta paramétrica.
router.patch("/leidas", authenticate, asyncHandler(marcarTodas));
router.patch("/:id/leida", authenticate, asyncHandler(marcarUnaLeida));

export default router;
