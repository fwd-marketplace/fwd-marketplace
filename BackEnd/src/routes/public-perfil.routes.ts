import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { optionalAuthenticate } from "../middlewares/auth.middleware";
import { getPublicEmpresa, getPublicEmpresas, getPublicJunior, getPublicEmpresaProyectos } from "../controllers/perfil.controller";

const router = Router();

router.get("/empresas", asyncHandler(getPublicEmpresas));
router.get("/empresa/:id", asyncHandler(getPublicEmpresa));
router.get("/empresa/:id/proyectos", asyncHandler(getPublicEmpresaProyectos));
// optionalAuthenticate: si llega token válido lo inyecta en req.user para
// poder registrar la visita de empresa; si no hay token, continúa igualmente.
router.get("/junior/:id", optionalAuthenticate, asyncHandler(getPublicJunior));

export default router;
