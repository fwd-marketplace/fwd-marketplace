import { Router } from "express";
import { list, detail, create } from "../controllers/proyecto.controller";
import { createForProject, listForProject } from "../controllers/oferta.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Protegidas: el RLS necesita la identidad del usuario (auth.uid()).
router.get("/", authenticate, asyncHandler(list));
router.post("/", authenticate, asyncHandler(create));
router.get("/:id", authenticate, asyncHandler(detail));

// Postulaciones de un proyecto: el junior postula, la empresa las consulta.
router.post("/:id/ofertas", authenticate, asyncHandler(createForProject));
router.get("/:id/ofertas", authenticate, asyncHandler(listForProject));

export default router;
