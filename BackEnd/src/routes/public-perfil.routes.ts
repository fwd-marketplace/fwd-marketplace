import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getPublicEmpresa, getPublicEmpresas, getPublicJunior, getPublicEmpresaProyectos } from "../controllers/perfil.controller";

const router = Router();

router.get("/empresas", asyncHandler(getPublicEmpresas));
router.get("/empresa/:id", asyncHandler(getPublicEmpresa));
router.get("/empresa/:id/proyectos", asyncHandler(getPublicEmpresaProyectos));
router.get("/junior/:id", asyncHandler(getPublicJunior));

export default router;
