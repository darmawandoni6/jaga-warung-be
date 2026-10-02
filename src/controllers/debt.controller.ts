import { Request, Response, NextFunction } from 'express';
import * as debtService from '@/services/debt.service';
import { successResponse } from '@/utils/response';
import { Unauthorized } from '@/utils/errors';

export const createDebtHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const debt = await debtService.createDebt(userId, req.body);
    res.status(201).json(successResponse(debt, 'Debt created successfully'));
  } catch (error) {
    next(error);
  }
};

export const recordPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const debtId = req.params.id as string;
    const debt = await debtService.recordPayment(userId, debtId, req.body);
    res.status(200).json(successResponse(debt, 'Debt payment recorded successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateDebtStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const debtId = req.params.id as string;
    const debt = await debtService.updateDebtStatus(userId, debtId, req.body);
    res.status(200).json(successResponse(debt, 'Debt status updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const getDebtsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const debts = await debtService.getDebts(userId, req.query as any);
    res.status(200).json(successResponse(debts, 'Debts retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getDebtByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const debtId = req.params.id as string;
    const debt = await debtService.getDebtById(userId, debtId);
    res.status(200).json(successResponse(debt, 'Debt retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteDebtHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const debtId = req.params.id as string;
    await debtService.deleteDebt(userId, debtId);
    res.status(200).json(successResponse(null, 'Debt deleted successfully'));
  } catch (error) {
    next(error);
  }
};
