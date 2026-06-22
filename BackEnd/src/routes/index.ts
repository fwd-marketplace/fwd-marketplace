import { Router } from "express";
import userRoutes from "./user.routes";
import onboardingRoutes from "./onboarding.routes";
import perfilRoutes from "./perfil.routes";
import adminRoutes from "./admin.routes";
import catalogRoutes from "./catalog.routes";
import projectRoutes from "./proyecto.routes";
import estudianteRoutes from "./estudiante.routes";
import ofertaRoutes from "./oferta.routes";
import entregableRoutes from "./entregable.routes";
import rankingRoutes from "./ranking.routes";
import mensajesRoutes from "./mensajes.routes";
import reporteRoutes from "./reporte.routes";
import notificacionRoutes from "./notificacion.routes";
import aiRoutes from "./ai.routes";
import uploadRoutes from "./upload.routes";
import guardadoRoutes from "./guardado.routes";
import { asyncHandler } from "../utils/asyncHandler";
import { isDatabaseReachable } from "../services/health.service";

const router = Router();

/** Healthcheck: comprueba que el BackEnd responde y que la BD es accesible. */
router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const dbOk = await isDatabaseReachable();
    res.status(dbOk ? 200 : 503).json({
      status: dbOk ? "ok" : "degraded",
      db: dbOk ? "ok" : "down",
    });
  }),
);

router.use("/users/onboarding", onboardingRoutes);
router.use("/users/me/perfil", perfilRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/catalogs", catalogRoutes);
router.use("/projects", projectRoutes);
router.use("/students", estudianteRoutes);
router.use("/ofertas", ofertaRoutes);
router.use("/entregables", entregableRoutes);
router.use("/ranking", rankingRoutes);
router.use("/mensajes", mensajesRoutes);
router.use("/reportes", reporteRoutes);
router.use("/notificaciones", notificacionRoutes);
router.use("/ai", aiRoutes);
router.use("/upload", uploadRoutes);
router.use("/guardados", guardadoRoutes);

export default router;
