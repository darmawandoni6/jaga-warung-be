import { Router } from 'express';
import * as transactionController from '@/controllers/transaction.controller';
import { validateRequest } from '@/middlewares/validate.middleware';
import {
  createTransactionSchema,
  queryTransactionSchema,
  getTransactionByIdSchema,
} from '@/schemas/transaction.schema';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validateRequest(queryTransactionSchema),
  transactionController.getTransactionsHandler
);
router.get(
  '/:id',
  validateRequest(getTransactionByIdSchema),
  transactionController.getTransactionByIdHandler
);
router.post(
  '/',
  validateRequest(createTransactionSchema),
  transactionController.createTransactionHandler
);

export default router;
