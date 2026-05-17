import { Router } from 'express';
import {authMiddleware} from '../middlewares/auth.middleware.js';
import { deleteProfile } from '../controllers/profile.controller.js';

const router = Router();

router.get('/profile', /*authMiddleware, */(req, res) => {
  const user = (req as any).user;

  res.json({
    message: 'Ruta protegida',
    user,
  });
});



router.delete("/profile/:id", authMiddleware, deleteProfile);



export default router;

