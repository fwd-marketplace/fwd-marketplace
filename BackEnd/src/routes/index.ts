import { Router } from "express";
import userRoutes from "./user.routes";

const router = Router();

/** Healthcheck simple para comprobar que el BackEnd responde. */
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/users", userRoutes);

export default router;
