import { Router, Request, Response } from 'express';
import authRoutes from '@/routes/auth.routes';
import categoryRoutes from '@/routes/category.routes';
import productRoutes from '@/routes/product.routes';
import stockMovementRoutes from '@/routes/stock-movement.routes';
import cashFlowRoutes from '@/routes/cash-flow.routes';
import transactionRoutes from '@/routes/transaction.routes';
import debtRoutes from '@/routes/debt.routes';
import settingsRoutes from '@/routes/settings.routes';
import { successResponse } from '@/utils/response';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json(
    successResponse(
      {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      'Service is healthy'
    )
  );
});

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/stock-movements', stockMovementRoutes);
router.use('/cash-flows', cashFlowRoutes);
router.use('/transactions', transactionRoutes);
router.use('/debts', debtRoutes);
router.use('/settings', settingsRoutes);

export default router;
