import { Router } from "express";
import { marcarPago } from "../controllers/pagos.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.put(
  "/pagos/:pagoId",
  authMiddleware,
  marcarPago
);

export default router;