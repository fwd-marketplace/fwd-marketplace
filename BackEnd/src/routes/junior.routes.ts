import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { getHeroJourneyController } from "../controllers/heroJourney.controller";
import { getJuniorDashboardController } from "../controllers/juniorDashboard.controller";

const router = Router();

router.get("/hero-journey", authenticate, asyncHandler(getHeroJourneyController));
router.get("/dashboard", authenticate, asyncHandler(getJuniorDashboardController));

export default router;
