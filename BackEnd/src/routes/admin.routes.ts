import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/requireAdmin.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  getSettings,
  updateSettings,
  listPending,
  approve,
  reject,
  suspend,
  listAll,
  detail,
  create,
  update,
  remove,
  listCompanies,
  createCompanyController,
  updateCompanyController,
  listProjects,
  cancel,
  listStudents,
  listPendingEgresados,
  verifyEgresado,
  rejectEgresado,
} from "../controllers/admin.controller";
import { listReportes, resolverReporte } from "../controllers/reporte.controller";

const router = Router();

// Todas exigen sesión + rol admin.
// Configuración global del marketplace.
router.get("/settings", authenticate, requireAdmin, asyncHandler(getSettings));
router.patch("/settings", authenticate, requireAdmin, asyncHandler(updateSettings));
// Las rutas literales (/users/pending) van ANTES que las paramétricas (/users/:id)
// para que Express no interprete "pending" como un :id.
router.get("/users/pending", authenticate, requireAdmin, asyncHandler(listPending));
router.get("/users", authenticate, requireAdmin, asyncHandler(listAll));
router.post("/users", authenticate, requireAdmin, asyncHandler(create));
router.get("/users/:id", authenticate, requireAdmin, asyncHandler(detail));
router.patch("/users/:id/aprobar", authenticate, requireAdmin, asyncHandler(approve));
router.patch("/users/:id/rechazar", authenticate, requireAdmin, asyncHandler(reject));
router.patch("/users/:id/suspender", authenticate, requireAdmin, asyncHandler(suspend));
router.patch("/users/:id", authenticate, requireAdmin, asyncHandler(update));
router.delete("/users/:id", authenticate, requireAdmin, asyncHandler(remove));
router.get("/companies", authenticate, requireAdmin, asyncHandler(listCompanies));
router.post("/companies", authenticate, requireAdmin, asyncHandler(createCompanyController));
router.patch("/companies/:id", authenticate, requireAdmin, asyncHandler(updateCompanyController));
router.get("/projects", authenticate, requireAdmin, asyncHandler(listProjects));
router.patch("/projects/:id/cancelar", authenticate, requireAdmin, asyncHandler(cancel));
// Talento + verificación de egresados FWD (:id = estudiante.id).
router.get("/students", authenticate, requireAdmin, asyncHandler(listStudents));
router.get("/students/pending", authenticate, requireAdmin, asyncHandler(listPendingEgresados));
router.patch("/students/:id/verificar", authenticate, requireAdmin, asyncHandler(verifyEgresado));
router.patch("/students/:id/rechazar", authenticate, requireAdmin, asyncHandler(rejectEgresado));
// Moderación de mensajes reportados.
router.get("/reportes", authenticate, requireAdmin, asyncHandler(listReportes));
router.patch("/reportes/:id/resolver", authenticate, requireAdmin, asyncHandler(resolverReporte));

export default router;
