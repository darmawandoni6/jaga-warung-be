import { Router } from 'express';
import * as settingsController from '@/controllers/settings.controller';
import { validateRequest } from '@/middlewares/validate.middleware';
import { updateStoreProfileSchema } from '@/schemas/settings.schema';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', settingsController.getStoreProfileHandler);
router.put(
  '/profile',
  validateRequest(updateStoreProfileSchema),
  settingsController.updateStoreProfileHandler
);

export default router;
