import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { getProgressController, upsertProgressController } from "../controllers/viaje.controller";

const router = Router();

router.get("/progress", authenticate, asyncHandler(getProgressController));
router.put("/progress/:starId", authenticate, asyncHandler(upsertProgressController));

export default router;
