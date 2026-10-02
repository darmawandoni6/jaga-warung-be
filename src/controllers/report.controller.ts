import { Request, Response, NextFunction } from 'express';
import * as reportService from '@/services/report.service';
import { successResponse } from '@/utils/response';
import { Unauthorized } from '@/utils/errors';

export const getDashboardHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const metrics = await reportService.getDashboardMetrics(userId);
    res.status(200).json(successResponse(metrics, 'Dashboard metrics retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getFinancialReportHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const period = (req.query.period as reportService.ReportPeriod) ?? 'month';
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    const report = await reportService.getFinancialReport(userId, period, offset);
    res.status(200).json(successResponse(report, 'Financial report generated successfully'));
  } catch (error) {
    next(error);
  }
};
