import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
  resetPassword,
  confirmResetPassword,
  oauthStart,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/reset-password", asyncHandler(resetPassword));
router.post("/reset-password/confirm", asyncHandler(confirmResetPassword));
// Login social: devuelve la URL de autorizacion del provider (Google/GitHub).
router.get("/oauth/:provider", asyncHandler(oauthStart));
// Publicas a proposito: operan con el refresh_token cuando el access_token ya expiro.
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));
router.get("/me", authenticate, asyncHandler(me));

export default router;
