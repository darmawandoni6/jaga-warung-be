import { Router } from 'express';
import * as cashFlowController from '@/controllers/cash-flow.controller';
import { validateRequest } from '@/middlewares/validate.middleware';
import {
  createCashFlowSchema,
  queryCashFlowSchema,
  getCashFlowByIdSchema,
} from '@/schemas/cash-flow.schema';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest(queryCashFlowSchema), cashFlowController.getCashFlowsHandler);
router.get('/summary', cashFlowController.getCashFlowSummaryHandler);
router.post('/', validateRequest(createCashFlowSchema), cashFlowController.createCashFlowHandler);
router.delete(
  '/:id',
  validateRequest(getCashFlowByIdSchema),
  cashFlowController.deleteCashFlowHandler
);

export default router;
