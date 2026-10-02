import { Prisma } from '@prisma/client';
import prisma from '@/config/prisma';
import { BadRequest, NotFound } from '@/utils/errors';
import { CreateTransactionInput, QueryTransactionInput } from '@/schemas/transaction.schema';

export const formatTransaction = (t: any) => ({
  id: t.id,
  userId: t.userId,
  totalAmount: Number(t.totalAmount),
  paymentAmount: Number(t.paymentAmount),
  changeAmount: Number(t.changeAmount),
  note: t.note,
  createdAt: t.createdAt,
  items: t.items
    ? t.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productBarcode: item.productBarcode,
        productName: item.productName,
        sellPrice: Number(item.sellPrice),
        buyPrice: Number(item.buyPrice),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
      }))
    : [],
});

export const createTransaction = async (userId: string, input: CreateTransactionInput) => {
  return prisma.$transaction(async (tx) => {
    let computedTotalAmount = 0;
    const validatedItems: Array<{
      product: any;
      quantity: number;
      sellPrice: number;
      buyPrice: number;
      subtotal: number;
    }> = [];

    // 1. Validate all products and stock availability
    for (const itemInput of input.items) {
      const product = await tx.product.findFirst({
        where: { barcode: itemInput.productBarcode, userId },
      });

      if (!product) {
        throw NotFound(`Product with barcode "${itemInput.productBarcode}" not found`);
      }

      if (product.stock < itemInput.quantity) {
        throw BadRequest(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${itemInput.quantity}`
        );
      }

      const sellPrice =
        itemInput.sellPrice !== undefined ? itemInput.sellPrice : Number(product.sellPrice);
      const buyPrice = Number(product.buyPrice);
      const subtotal = sellPrice * itemInput.quantity;

      computedTotalAmount += subtotal;

      validatedItems.push({
        product,
        quantity: itemInput.quantity,
        sellPrice,
        buyPrice,
        subtotal,
      });
    }

    // 2. Validate payment amount
    if (input.paymentAmount < computedTotalAmount) {
      throw BadRequest(
        `Payment amount (${input.paymentAmount}) is less than total bill (${computedTotalAmount})`
      );
    }

    const changeAmount = input.paymentAmount - computedTotalAmount;

    // 3. Create Transaction header
    const transaction = await tx.transaction.create({
      data: {
        userId,
        totalAmount: computedTotalAmount,
        paymentAmount: input.paymentAmount,
        changeAmount,
        note: input.note ?? null,
      },
    });

    // 4. Process line items, stock deduction, and stock movements
    for (const item of validatedItems) {
      // Insert item
      await tx.transactionItem.create({
        data: {
          transactionId: transaction.id,
          productId: item.product.id,
          productBarcode: item.product.barcode,
          productName: item.product.name,
          sellPrice: item.sellPrice,
          buyPrice: item.buyPrice,
          quantity: item.quantity,
          subtotal: item.subtotal,
        },
      });

      // Deduct stock
      const previousStock = item.product.stock;
      const finalStock = previousStock - item.quantity;

      await tx.product.update({
        where: { id: item.product.id },
        data: { stock: finalStock },
      });

      // Create SALE StockMovement
      await tx.stockMovement.create({
        data: {
          userId,
          productId: item.product.id,
          productBarcode: item.product.barcode,
          type: 'SALE',
          quantity: item.quantity,
          previousStock,
          finalStock,
          totalCost: item.quantity * item.buyPrice,
          note: `Penjualan #${transaction.id.slice(0, 8)}`,
        },
      });
    }

    // 5. Create CashFlow income entry
    await tx.cashFlow.create({
      data: {
        userId,
        type: 'INCOME',
        amount: computedTotalAmount,
        note: `Penjualan #${transaction.id.slice(0, 8)}`,
        date: new Date(),
      },
    });

    // 6. Fetch complete created transaction
    const completeTransaction = await tx.transaction.findUnique({
      where: { id: transaction.id },
      include: { items: true },
    });

    return formatTransaction(completeTransaction);
  });
};

export const getTransactions = async (userId: string, query: QueryTransactionInput) => {
  const where: Prisma.TransactionWhereInput = {
    userId,
  };

  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) {
      where.createdAt.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      where.createdAt.lte = new Date(query.endDate);
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
    take: query.limit ?? 50,
    skip: query.offset ?? 0,
  });

  return transactions.map(formatTransaction);
};

export const getTransactionById = async (userId: string, id: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
    include: {
      items: true,
    },
  });

  if (!transaction) {
    throw NotFound('Transaction not found');
  }

  return formatTransaction(transaction);
};
