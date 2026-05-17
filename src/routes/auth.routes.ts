import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { getProfile } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { savePushToken } from '../controllers/auth.controller.js';
//import { authorize } from '../middlewares/role.middleware'


const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile/me', authMiddleware, getProfile)
//router.get('/profile/me', getProfile)

export default router;


//router.get(
//  "/admin-test",
//  authMiddleware,
//  authorize(["admin"]),
//  (req, res) => {
//    res.json({
//      message: "Bienvenido administrador ",
//      user: (req as any).user,
//    });
//  }
//);

router.post('/push-token', authMiddleware, savePushToken);