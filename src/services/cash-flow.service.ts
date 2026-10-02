import { Prisma, CashFlowType } from '@prisma/client';
import prisma from '@/config/prisma';
import { NotFound } from '@/utils/errors';
import { CreateCashFlowInput, QueryCashFlowInput } from '@/schemas/cash-flow.schema';

export const formatCashFlow = (c: any) => ({
  id: c.id,
  userId: c.userId,
  type: c.type,
  amount: Number(c.amount),
  note: c.note,
  date: c.date,
  createdAt: c.createdAt,
});

export const createCashFlow = async (userId: string, input: CreateCashFlowInput) => {
  const normalizedType = input.type.toUpperCase() as CashFlowType;
  const entryDate = input.date ? new Date(input.date) : new Date();

  const cashFlow = await prisma.cashFlow.create({
    data: {
      userId,
      type: normalizedType,
      amount: input.amount,
      note: input.note ?? '',
      date: entryDate,
    },
  });

  return formatCashFlow(cashFlow);
};

export const getCashFlows = async (userId: string, query: QueryCashFlowInput) => {
  const where: Prisma.CashFlowWhereInput = {
    userId,
  };

  if (query.type) {
    where.type = query.type;
  }

  if (query.startDate || query.endDate) {
    where.date = {};
    if (query.startDate) {
      where.date.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      where.date.lte = new Date(query.endDate);
    }
  }

  const entries = await prisma.cashFlow.findMany({
    where,
    orderBy: { date: 'desc' },
    take: query.limit ?? 50,
    skip: query.offset ?? 0,
  });

  return entries.map(formatCashFlow);
};

export const getCashFlowSummary = async (userId: string, query?: QueryCashFlowInput) => {
  const where: Prisma.CashFlowWhereInput = { userId };

  if (query?.startDate || query?.endDate) {
    where.date = {};
    if (query.startDate) {
      where.date.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      where.date.lte = new Date(query.endDate);
    }
  }

  const incomeSum = await prisma.cashFlow.aggregate({
    where: { ...where, type: 'INCOME' },
    _sum: { amount: true },
  });

  const expenseSum = await prisma.cashFlow.aggregate({
    where: { ...where, type: 'EXPENSE' },
    _sum: { amount: true },
  });

  const totalIncome = incomeSum._sum.amount ? Number(incomeSum._sum.amount) : 0;
  const totalExpense = expenseSum._sum.amount ? Number(expenseSum._sum.amount) : 0;
  const balance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    balance,
  };
};

export const deleteCashFlow = async (userId: string, id: string) => {
  const entry = await prisma.cashFlow.findFirst({
    where: { id, userId },
  });

  if (!entry) {
    throw NotFound('Cash flow entry not found');
  }

  await prisma.cashFlow.delete({
    where: { id },
  });
};
