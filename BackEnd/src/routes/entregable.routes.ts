import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { listMine, submit, review } from "../controllers/entregable.controller";

const router = Router();

// "/mios" va antes de "/:id" para que no lo capture la ruta paramétrica.
router.get("/mios", authenticate, asyncHandler(listMine));
router.post("/", authenticate, asyncHandler(submit));
router.patch("/:id", authenticate, asyncHandler(review));

export default router;
