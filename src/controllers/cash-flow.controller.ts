import { Request, Response, NextFunction } from 'express';
import * as cashFlowService from '@/services/cash-flow.service';
import { successResponse } from '@/utils/response';
import { Unauthorized } from '@/utils/errors';

export const createCashFlowHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const result = await cashFlowService.createCashFlow(userId, req.body);
    res.status(201).json(successResponse(result, 'Cash flow entry created successfully'));
  } catch (error) {
    next(error);
  }
};

export const getCashFlowsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const entries = await cashFlowService.getCashFlows(userId, req.query as any);
    res.status(200).json(successResponse(entries, 'Cash flow entries retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getCashFlowSummaryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const summary = await cashFlowService.getCashFlowSummary(userId, req.query as any);
    res.status(200).json(successResponse(summary, 'Cash flow summary calculated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteCashFlowHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const id = req.params.id as string;
    await cashFlowService.deleteCashFlow(userId, id);
    res.status(200).json(successResponse(null, 'Cash flow entry deleted successfully'));
  } catch (error) {
    next(error);
  }
};
