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
import { rateLimit } from "../middlewares/rateLimit.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const MINUTE = 60_000;

// Límites por IP para frenar abuso en auth sin estorbar el uso normal:
// fuerza bruta de login, enumeración/bombing del reset y spam de registro.
const loginLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  max: 10,
  message: "Demasiados intentos de inicio de sesión. Esperá unos minutos e intentá de nuevo.",
});
const registerLimiter = rateLimit({
  windowMs: 60 * MINUTE,
  max: 10,
  message: "Demasiados registros desde esta IP. Intentá más tarde.",
});
const resetLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  max: 5,
  message: "Demasiadas solicitudes de recuperación. Esperá unos minutos e intentá de nuevo.",
});
const resetConfirmLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  max: 10,
  message: "Demasiados intentos. Esperá unos minutos e intentá de nuevo.",
});

router.post("/register", registerLimiter, asyncHandler(register));
router.post("/login", loginLimiter, asyncHandler(login));
// Paso 2 del login: valida el código de 2FA enviado por email y entrega la sesión.
router.post("/login/verify-otp", loginLimiter, asyncHandler(verifyLoginOtp));
router.post("/reset-password", resetLimiter, asyncHandler(resetPassword));
router.post("/reset-password/confirm", resetConfirmLimiter, asyncHandler(confirmResetPassword));
// Login social: devuelve la URL de autorizacion del provider (Google/GitHub).
router.get("/oauth/:provider", asyncHandler(oauthStart));
// Publicas a proposito: operan con el refresh_token cuando el access_token ya expiro.
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));
router.get("/me", authenticate, asyncHandler(me));

export default router;
