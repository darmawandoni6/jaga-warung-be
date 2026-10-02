import { Request, Response, NextFunction } from 'express';
import * as transactionService from '@/services/transaction.service';
import { successResponse } from '@/utils/response';
import { Unauthorized } from '@/utils/errors';

export const createTransactionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const transaction = await transactionService.createTransaction(userId, req.body);
    res.status(201).json(successResponse(transaction, 'Transaction created successfully'));
  } catch (error) {
    next(error);
  }
};

export const getTransactionsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const transactions = await transactionService.getTransactions(userId, req.query as any);
    res.status(200).json(successResponse(transactions, 'Transactions retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getTransactionByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw Unauthorized();

    const id = req.params.id as string;
    const transaction = await transactionService.getTransactionById(userId, id);
    res.status(200).json(successResponse(transaction, 'Transaction retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
