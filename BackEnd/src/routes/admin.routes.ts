import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/requireAdmin.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  listPending,
  listStudents,
  approve,
  reject,
  suspend,
  listProjects,
  cancel,
} from "../controllers/admin.controller";

const router = Router();

// Todas exigen sesión + rol admin.
router.get("/users/pending", authenticate, requireAdmin, asyncHandler(listPending));
router.get("/users/estudiantes", authenticate, requireAdmin, asyncHandler(listStudents));
router.patch("/users/:id/aprobar", authenticate, requireAdmin, asyncHandler(approve));
router.patch("/users/:id/rechazar", authenticate, requireAdmin, asyncHandler(reject));
router.patch("/users/:id/suspender", authenticate, requireAdmin, asyncHandler(suspend));
router.get("/projects", authenticate, requireAdmin, asyncHandler(listProjects));
router.patch("/projects/:id/cancelar", authenticate, requireAdmin, asyncHandler(cancel));

export default router;
