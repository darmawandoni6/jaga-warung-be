import { Router, Request, Response } from 'express';
import authRoutes from '@/routes/auth.routes';
import categoryRoutes from '@/routes/category.routes';
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

export default router;
