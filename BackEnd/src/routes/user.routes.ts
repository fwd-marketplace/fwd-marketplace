import { Router } from "express";
import {
  register,
  login,
  verifyLoginOtp,
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
// Paso 2 del login: valida el código de 2FA enviado por email y entrega la sesión.
router.post("/login/verify-otp", asyncHandler(verifyLoginOtp));
router.post("/reset-password", asyncHandler(resetPassword));
router.post("/reset-password/confirm", asyncHandler(confirmResetPassword));
// Login social: devuelve la URL de autorizacion del provider (Google/GitHub).
router.get("/oauth/:provider", asyncHandler(oauthStart));
// Publicas a proposito: operan con el refresh_token cuando el access_token ya expiro.
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));
router.get("/me", authenticate, asyncHandler(me));

export default router;
