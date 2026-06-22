import { Router } from "express";
import { search } from "../controllers/estudiante.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Directorio de talento (empresa/emprendedor). El RLS limita los resultados a
// estudiantes verificados y solo para company/admin.
router.get("/search", authenticate, asyncHandler(search));

export default router;
