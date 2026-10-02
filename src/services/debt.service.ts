import { Prisma, DebtStatus } from '@prisma/client';
import prisma from '@/config/prisma';
import { BadRequest, NotFound } from '@/utils/errors';
import {
  CreateDebtInput,
  RecordDebtPaymentInput,
  UpdateDebtStatusInput,
  QueryDebtInput,
} from '@/schemas/debt.schema';

export const formatDebt = (d: any) => {
  const totalDebt = Number(d.totalDebt);
  const paidAmount = Number(d.paidAmount);
  const remainingDebt = Math.max(0, totalDebt - paidAmount);

  return {
    id: d.id,
    userId: d.userId,
    customerName: d.customerName,
    phone: d.phone,
    totalDebt,
    paidAmount,
    remainingDebt,
    status: d.status,
    note: d.note,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    payments: d.payments
      ? d.payments.map((p: any) => ({
          id: p.id,
          debtId: p.debtId,
          amount: Number(p.amount),
          note: p.note,
          createdAt: p.createdAt,
        }))
      : [],
  };
};

export const createDebt = async (userId: string, input: CreateDebtInput) => {
  const paidAmount = input.paidAmount ?? 0;
  let status: DebtStatus = DebtStatus.ACTIVE;

  if (paidAmount >= input.totalDebt) {
    status = DebtStatus.PAID;
  } else if (paidAmount > 0) {
    status = DebtStatus.PARTIAL;
  }

  return prisma.$transaction(async (tx) => {
    const debt = await tx.debt.create({
      data: {
        userId,
        customerName: input.customerName,
        phone: input.phone ?? null,
        totalDebt: input.totalDebt,
        paidAmount,
        status,
        note: input.note ?? null,
      },
    });

    if (paidAmount > 0) {
      await tx.debtPayment.create({
        data: {
          debtId: debt.id,
          amount: paidAmount,
          note: 'Down payment / initial payment',
        },
      });

      await tx.cashFlow.create({
        data: {
          userId,
          type: 'INCOME',
          amount: paidAmount,
          note: `Pembayaran awal kasbon: ${debt.customerName}`,
          date: new Date(),
        },
      });
    }

    const created = await tx.debt.findUnique({
      where: { id: debt.id },
      include: { payments: true },
    });

    return formatDebt(created);
  });
};

export const recordPayment = async (
  userId: string,
  debtId: string,
  input: RecordDebtPaymentInput
) => {
  const debt = await prisma.debt.findFirst({
    where: { id: debtId, userId },
  });

  if (!debt) {
    throw NotFound('Debt record not found');
  }

  if (debt.status === DebtStatus.PAID) {
    throw BadRequest('This debt is already fully paid');
  }

  const currentPaid = Number(debt.paidAmount);
  const total = Number(debt.totalDebt);
  const remaining = total - currentPaid;

  if (input.amount > remaining) {
    throw BadRequest(`Payment amount (${input.amount}) exceeds remaining debt (${remaining})`);
  }

  const newPaidAmount = currentPaid + input.amount;
  const newStatus: DebtStatus = newPaidAmount >= total ? DebtStatus.PAID : DebtStatus.PARTIAL;

  return prisma.$transaction(async (tx) => {
    await tx.debtPayment.create({
      data: {
        debtId: debt.id,
        amount: input.amount,
        note: input.note ?? 'Cicilan kasbon',
      },
    });

    const updatedDebt = await tx.debt.update({
      where: { id: debt.id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
      include: { payments: true },
    });

    await tx.cashFlow.create({
      data: {
        userId,
        type: 'INCOME',
        amount: input.amount,
        note: input.note
          ? `Bayar kasbon: ${debt.customerName} (${input.note})`
          : `Bayar kasbon: ${debt.customerName} (Rp ${input.amount.toLocaleString('id-ID')})`,
        date: new Date(),
      },
    });

    return formatDebt(updatedDebt);
  });
};

export const updateDebtStatus = async (
  userId: string,
  debtId: string,
  input: UpdateDebtStatusInput
) => {
  const debt = await prisma.debt.findFirst({
    where: { id: debtId, userId },
  });

  if (!debt) {
    throw NotFound('Debt record not found');
  }

  const normalizedStatus = input.status.toUpperCase() as DebtStatus;

  const updated = await prisma.debt.update({
    where: { id: debtId },
    data: { status: normalizedStatus },
    include: { payments: true },
  });

  return formatDebt(updated);
};

export const getDebts = async (userId: string, query: QueryDebtInput) => {
  const where: Prisma.DebtWhereInput = {
    userId,
  };

  if (query.status) {
    where.status = query.status.toUpperCase() as DebtStatus;
  }

  if (query.search) {
    where.OR = [
      { customerName: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const debts = await prisma.debt.findMany({
    where,
    include: {
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
    take: query.limit ?? 50,
    skip: query.offset ?? 0,
  });

  return debts.map(formatDebt);
};

export const getDebtById = async (userId: string, id: string) => {
  const debt = await prisma.debt.findFirst({
    where: { id, userId },
    include: {
      payments: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!debt) {
    throw NotFound('Debt record not found');
  }

  return formatDebt(debt);
};

export const deleteDebt = async (userId: string, id: string) => {
  const debt = await prisma.debt.findFirst({
    where: { id, userId },
  });

  if (!debt) {
    throw NotFound('Debt record not found');
  }

  await prisma.debt.delete({
    where: { id },
  });
};
