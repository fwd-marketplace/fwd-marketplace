import { Router } from "express";
import userRoutes from "./user.routes";
import onboardingRoutes from "./onboarding.routes";
import adminRoutes from "./admin.routes";
import catalogRoutes from "./catalog.routes";
import projectRoutes from "./proyecto.routes";
import ofertaRoutes from "./oferta.routes";

const router = Router();

/** Healthcheck simple para comprobar que el BackEnd responde. */
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/users/onboarding", onboardingRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/catalogs", catalogRoutes);
router.use("/projects", projectRoutes);
router.use("/ofertas", ofertaRoutes);

export default router;
