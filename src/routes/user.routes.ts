import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/profile",/* authMiddleware,*/ (req, res) => {
  res.json({
    message: "Access granted",
    user: (req as any).user,
  });
});

export default router;
