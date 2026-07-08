import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { list, listIds, save, remove } from "../controllers/guardado.controller";

const router = Router();

router.get("/", authenticate, asyncHandler(list));
router.get("/ids", authenticate, asyncHandler(listIds));
router.post("/:proyectoId", authenticate, asyncHandler(save));
router.delete("/:proyectoId", authenticate, asyncHandler(remove));

export default router;
