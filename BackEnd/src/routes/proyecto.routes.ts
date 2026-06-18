import { Router } from "express";
import { list, listMine, detail, create, changeState, update } from "../controllers/proyecto.controller";
import { createForProject, listForProject } from "../controllers/oferta.controller";
import { listForProject as listEntregablesForProject } from "../controllers/entregable.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Protegidas: el RLS necesita la identidad del usuario (auth.uid()).
router.get("/", authenticate, asyncHandler(list));
// "/mias" debe ir ANTES de "/:id" para que Express no lo tome como un id.
router.get("/mias", authenticate, asyncHandler(listMine));
router.post("/", authenticate, asyncHandler(create));
router.get("/:id", authenticate, asyncHandler(detail));
// La empresa dueña gestiona el ciclo de vida de su proyecto.
router.patch("/:id/estado", authenticate, asyncHandler(changeState));
// La empresa edita los datos de su proyecto (solo en borrador o en_recepcion).
router.patch("/:id", authenticate, asyncHandler(update));

// Postulaciones de un proyecto: el junior postula, la empresa las consulta.
router.post("/:id/ofertas", authenticate, asyncHandler(createForProject));
router.get("/:id/ofertas", authenticate, asyncHandler(listForProject));

// Entregables de un proyecto (empresa dueña los consulta).
// Debe ir ANTES de rutas /:id genéricas (ya están arriba, pero se agrega aquí al final).
router.get("/:id/entregables", authenticate, asyncHandler(listEntregablesForProject));

export default router;
