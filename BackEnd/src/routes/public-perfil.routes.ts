import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getPublicEmpresa, getPublicJunior, getPublicEmpresaProyectos } from "../controllers/perfil.controller";

const router = Router();

router.get("/empresa/:id", asyncHandler(getPublicEmpresa));
router.get("/empresa/:id/proyectos", asyncHandler(getPublicEmpresaProyectos));
router.get("/junior/:id", asyncHandler(getPublicJunior));

export default router;
