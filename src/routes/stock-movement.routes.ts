import { Router } from 'express';
import * as stockMovementController from '@/controllers/stock-movement.controller';
import { validateRequest } from '@/middlewares/validate.middleware';
import {
  restockSchema,
  adjustStockSchema,
  queryStockMovementSchema,
} from '@/schemas/stock-movement.schema';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validateRequest(queryStockMovementSchema),
  stockMovementController.getMovementsHandler
);
router.get('/stats', stockMovementController.getMovementStatsHandler);
router.post('/restock', validateRequest(restockSchema), stockMovementController.restockHandler);
router.post(
  '/adjust',
  validateRequest(adjustStockSchema),
  stockMovementController.adjustStockHandler
);

export default router;
