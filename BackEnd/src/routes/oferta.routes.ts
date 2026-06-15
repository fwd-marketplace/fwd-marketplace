import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { listMine, decide } from "../controllers/oferta.controller";

const router = Router();

// Mis postulaciones (junior) y decisión de la empresa.
router.get("/mias", authenticate, asyncHandler(listMine));
router.patch("/:id", authenticate, asyncHandler(decide));

export default router;
