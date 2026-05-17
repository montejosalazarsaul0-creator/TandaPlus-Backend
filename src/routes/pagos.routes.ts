import { Router } from "express";
import { marcarPago } from "../controllers/pagos.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.put(
  "/pagos/:pagoId",
  authMiddleware,
  marcarPago
);

export default router;