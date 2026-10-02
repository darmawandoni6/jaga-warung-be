import { Router } from 'express';
import * as authController from '@/controllers/auth.controller';
import { validateRequest } from '@/middlewares/validate.middleware';
import { registerSchema, loginSchema } from '@/schemas/auth.schema';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

router.post('/register', validateRequest(registerSchema), authController.registerHandler);
router.post('/login', validateRequest(loginSchema), authController.loginHandler);
router.post('/refresh', authController.refreshHandler);
router.post('/logout', authenticate, authController.logoutHandler);
router.get('/me', authenticate, authController.meHandler);

export default router;
