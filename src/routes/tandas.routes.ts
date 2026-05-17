import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { createTandaController, getMisTandasController } from "../controllers/tandas.controller";
import { joinTandaController } from "../controllers/tandas.controller";
import { addUserToTandaController } from "../controllers/tandas.controller";
import { removeParticipante } from "../controllers/tandas.controller";
import { deleteTandaController } from "../controllers/tandas.controller";
import { getTandaByIdController } from "../controllers/tandas.controller";
import { joinByCodeController } from "../controllers/tandas.controller";
import { verificarCodigoController } from "../controllers/tandas.controller"; 
import { getSolicitudesController,aceptarSolicitudController,rechazarSolicitudController} from "../controllers/tandas.controller";

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

