import { Router } from "express";
import { list, detail, create } from "../controllers/proyecto.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Protegidas: el RLS necesita la identidad del usuario (auth.uid()).
router.get("/", authenticate, asyncHandler(list));
router.post("/", authenticate, asyncHandler(create));
router.get("/:id", authenticate, asyncHandler(detail));

export default router;
