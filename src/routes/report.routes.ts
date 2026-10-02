import { Router } from 'express';
import * as reportController from '@/controllers/report.controller';
import { authenticate } from '@/middlewares/auth.middleware';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);
dashboardRouter.get('/', reportController.getDashboardHandler);

export const reportRouter = Router();
reportRouter.use(authenticate);
reportRouter.get('/financial', reportController.getFinancialReportHandler);

export default { dashboardRouter, reportRouter };
