import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/requireAdmin.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  listPending,
  approve,
  reject,
  suspend,
  listProjects,
  cancel,
  listStudents,
  listPendingEgresados,
  verifyEgresado,
  rejectEgresado,
} from "../controllers/admin.controller";

const router = Router();

// Todas exigen sesión + rol admin.
router.get("/users/pending", authenticate, requireAdmin, asyncHandler(listPending));
router.patch("/users/:id/aprobar", authenticate, requireAdmin, asyncHandler(approve));
router.patch("/users/:id/rechazar", authenticate, requireAdmin, asyncHandler(reject));
router.patch("/users/:id/suspender", authenticate, requireAdmin, asyncHandler(suspend));
router.get("/projects", authenticate, requireAdmin, asyncHandler(listProjects));
router.patch("/projects/:id/cancelar", authenticate, requireAdmin, asyncHandler(cancel));
// Talento + verificación de egresados FWD (:id = estudiante.id).
router.get("/students", authenticate, requireAdmin, asyncHandler(listStudents));
router.get("/students/pending", authenticate, requireAdmin, asyncHandler(listPendingEgresados));
router.patch("/students/:id/verificar", authenticate, requireAdmin, asyncHandler(verifyEgresado));
router.patch("/students/:id/rechazar", authenticate, requireAdmin, asyncHandler(rejectEgresado));

export default router;
