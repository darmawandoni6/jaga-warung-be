import { Router } from 'express';
import * as debtController from '@/controllers/debt.controller';
import { validateRequest } from '@/middlewares/validate.middleware';
import {
  createDebtSchema,
  recordDebtPaymentSchema,
  updateDebtStatusSchema,
  queryDebtSchema,
  getDebtByIdSchema,
} from '@/schemas/debt.schema';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest(queryDebtSchema), debtController.getDebtsHandler);
router.get('/:id', validateRequest(getDebtByIdSchema), debtController.getDebtByIdHandler);
router.post('/', validateRequest(createDebtSchema), debtController.createDebtHandler);
router.post(
  '/:id/payments',
  validateRequest(recordDebtPaymentSchema),
  debtController.recordPaymentHandler
);
router.patch(
  '/:id/status',
  validateRequest(updateDebtStatusSchema),
  debtController.updateDebtStatusHandler
);
router.delete('/:id', validateRequest(getDebtByIdSchema), debtController.deleteDebtHandler);

export default router;
