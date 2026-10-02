import { Request, Response, NextFunction } from 'express';
import * as stockMovementService from '@/services/stock-movement.service';
import { successResponse } from '@/utils/response';
import { Unauthorized } from '@/utils/errors';

export const restockHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const result = await stockMovementService.restockProduct(userId, req.body);
    res.status(200).json(successResponse(result, 'Product restocked successfully'));
  } catch (error) {
    next(error);
  }
};

export const adjustStockHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const result = await stockMovementService.adjustStock(userId, req.body);
    res.status(200).json(successResponse(result, 'Stock adjusted successfully'));
  } catch (error) {
    next(error);
  }
};

export const getMovementsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const movements = await stockMovementService.getMovements(userId, req.query as any);
    res.status(200).json(successResponse(movements, 'Stock movements retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getMovementStatsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const stats = await stockMovementService.getMovementStats(userId);
    res
      .status(200)
      .json(successResponse(stats, 'Stock movement statistics retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
