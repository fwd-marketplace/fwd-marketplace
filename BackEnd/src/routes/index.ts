import { Router } from "express";
import userRoutes from "./user.routes";
import onboardingRoutes from "./onboarding.routes";
import perfilRoutes from "./perfil.routes";
import adminRoutes from "./admin.routes";
import catalogRoutes from "./catalog.routes";
import projectRoutes from "./proyecto.routes";
import ofertaRoutes from "./oferta.routes";
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
router.use("/ofertas", ofertaRoutes);
 

export default router;
