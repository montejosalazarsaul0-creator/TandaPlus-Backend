import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  createTandaController,
  getMisTandasController,
  joinTandaController,
  addUserToTandaController,
  removeParticipante,
  deleteTandaController,
  getTandaByIdController,
  joinByCodeController,
  verificarCodigoController,
  getSolicitudesController,
  aceptarSolicitudController,
  rechazarSolicitudController
} from "../controllers/tandas.controller.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createTandaController
);

router.post(
  "/:id/join",
  authMiddleware,
  authorize(["user",]),
  joinTandaController
);

router.post(
  "/:id/add-user",
  authMiddleware,
  authorize(["admin"]),
  addUserToTandaController
);

router.delete(
  "/:tandaId/participantes/:userId",
  authMiddleware,
  removeParticipante
);

router.delete(
  "/:id",
  authMiddleware,
  deleteTandaController
);

router.get(
  "/mis-tandas",
  authMiddleware,
  getMisTandasController
);

router.get(
  "/:id",
  authMiddleware,
  getTandaByIdController
);

router.post(
  "/join-by-code",
  authMiddleware,
  joinByCodeController
);

router.get(
  "/verificar-codigo/:codigo",
  authMiddleware,
  verificarCodigoController
);

// Ver solicitudes pendientes (solo admin)
router.get(
  "/:tandaId/solicitudes",
  authMiddleware,
  getSolicitudesController
);

// Aceptar solicitud
router.put(
  "/:tandaId/solicitudes/:userId/aceptar",
  authMiddleware,
  aceptarSolicitudController
);

// Rechazar solicitud
router.put(
  "/:tandaId/solicitudes/:userId/rechazar",
  authMiddleware,
  rechazarSolicitudController
);


export default router;

