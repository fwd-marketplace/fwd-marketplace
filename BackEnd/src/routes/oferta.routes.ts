import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { listMine, getOne, decide } from "../controllers/oferta.controller";

const router = Router();

// Mis postulaciones (junior) y decisión de la empresa.
// "/mias" va antes de "/:id" para que no lo capture la ruta paramétrica.
router.get("/mias", authenticate, asyncHandler(listMine));
router.get("/:id", authenticate, asyncHandler(getOne));
router.patch("/:id", authenticate, asyncHandler(decide));

export default router;
