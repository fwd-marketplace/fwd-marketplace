import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { listMine, listMisCalificaciones, getOne, decide, review, edit, withdraw, calificar, replica } from "../controllers/oferta.controller";

const router = Router();

// Mis postulaciones (junior) y decisión de la empresa.
// "/mias" va antes de "/:id" para que no lo capture la ruta paramétrica.
router.get("/mias", authenticate, asyncHandler(listMine));
router.get("/mis-calificaciones", authenticate, asyncHandler(listMisCalificaciones));
router.get("/:id", authenticate, asyncHandler(getOne));
router.patch("/:id", authenticate, asyncHandler(decide));
router.patch("/:id/revisar", authenticate, asyncHandler(review));
router.patch("/:id/editar", authenticate, asyncHandler(edit));
router.delete("/:id/retirar", authenticate, asyncHandler(withdraw));
router.post("/:id/calificar", authenticate, asyncHandler(calificar));
router.post("/:id/replica", authenticate, asyncHandler(replica));

export default router;
