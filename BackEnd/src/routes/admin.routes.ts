import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/requireAdmin.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { listPending, approve } from "../controllers/admin.controller";

const router = Router();

// Todas exigen sesión + rol admin.
router.get("/users/pending", authenticate, requireAdmin, asyncHandler(listPending));
router.patch("/users/:id/aprobar", authenticate, requireAdmin, asyncHandler(approve));

export default router;
