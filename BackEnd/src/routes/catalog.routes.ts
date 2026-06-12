import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { catalogs } from "../controllers/catalog.controller";

const router = Router();

// Lectura para autenticados (el RLS de catálogos exige auth.uid()).
router.get("/", authenticate, asyncHandler(catalogs));

export default router;
