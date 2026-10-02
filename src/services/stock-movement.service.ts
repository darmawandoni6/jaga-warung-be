import { Prisma, StockMovementType } from '@prisma/client';
import prisma from '@/config/prisma';
import { BadRequest, NotFound } from '@/utils/errors';
import {
  RestockInput,
  AdjustStockInput,
  QueryStockMovementInput,
} from '@/schemas/stock-movement.schema';

export const formatStockMovement = (m: any) => ({
  id: m.id,
  userId: m.userId,
  productId: m.productId,
  productBarcode: m.productBarcode,
  productName: m.product?.name ?? null,
  productType: m.product?.type ?? null,
  type: m.type,
  quantity: m.quantity,
  previousStock: m.previousStock,
  finalStock: m.finalStock,
  totalCost: m.totalCost ? Number(m.totalCost) : 0,
  note: m.note,
  createdAt: m.createdAt,
});

export const restockProduct = async (userId: string, input: RestockInput) => {
  const product = await prisma.product.findFirst({
    where: { barcode: input.productBarcode, userId },
  });

  if (!product) {
    throw NotFound(`Product with barcode "${input.productBarcode}" not found`);
  }

  const effectiveBuyPrice =
    input.buyPrice !== undefined ? input.buyPrice : Number(product.buyPrice);
  const totalCost = input.quantity * effectiveBuyPrice;
  const previousStock = product.stock;
  const finalStock = previousStock + input.quantity;

  return prisma.$transaction(async (tx) => {
    // 1. Update product stock & buyPrice
    const updatedProduct = await tx.product.update({
      where: { id: product.id },
      data: {
        stock: finalStock,
        ...(input.buyPrice !== undefined && { buyPrice: input.buyPrice }),
      },
    });

    // 2. Create StockMovement
    const movement = await tx.stockMovement.create({
      data: {
        userId,
        productId: product.id,
        productBarcode: product.barcode,
        type: 'RESTOCK',
        quantity: input.quantity,
        previousStock,
        finalStock,
        totalCost,
        note: input.note ?? 'Restok produk',
      },
      include: { product: true },
    });

    // 3. Create CashFlow expense if requested
    if (input.recordToCashFlow && totalCost > 0) {
      await tx.cashFlow.create({
        data: {
          userId,
          type: 'EXPENSE',
          amount: totalCost,
          note: input.note
            ? `Restok: ${product.name} (${input.note})`
            : `Restok: ${product.name} (${input.quantity} pcs)`,
          date: new Date(),
        },
      });
    }

    return {
      movement: formatStockMovement(movement),
      product: {
        id: updatedProduct.id,
        barcode: updatedProduct.barcode,
        name: updatedProduct.name,
        stock: updatedProduct.stock,
        buyPrice: Number(updatedProduct.buyPrice),
      },
    };
  });
};

export const adjustStock = async (userId: string, input: AdjustStockInput) => {
  const product = await prisma.product.findFirst({
    where: { barcode: input.productBarcode, userId },
  });

  if (!product) {
    throw NotFound(`Product with barcode "${input.productBarcode}" not found`);
  }

  const normalizedType = input.type.toUpperCase() as StockMovementType;
  const previousStock = product.stock;
  let finalStock = previousStock;

  if (normalizedType === 'ADJUSTMENT_LOSS') {
    if (previousStock < input.quantity) {
      throw BadRequest(
        `Cannot reduce stock by ${input.quantity}. Current stock is ${previousStock}`
      );
    }
    finalStock = previousStock - input.quantity;
  } else if (normalizedType === 'ADJUSTMENT_GAIN') {
    finalStock = previousStock + input.quantity;
  } else {
    throw BadRequest('Invalid adjustment type');
  }

  return prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id: product.id },
      data: { stock: finalStock },
    });

    const movement = await tx.stockMovement.create({
      data: {
        userId,
        productId: product.id,
        productBarcode: product.barcode,
        type: normalizedType,
        quantity: input.quantity,
        previousStock,
        finalStock,
        totalCost: 0,
        note: input.reason,
      },
      include: { product: true },
    });

    return {
      movement: formatStockMovement(movement),
      product: {
        id: updatedProduct.id,
        barcode: updatedProduct.barcode,
        name: updatedProduct.name,
        stock: updatedProduct.stock,
      },
    };
  });
};

export const getMovements = async (userId: string, query: QueryStockMovementInput) => {
  const where: Prisma.StockMovementWhereInput = {
    userId,
  };

  if (query.productBarcode) {
    where.productBarcode = query.productBarcode;
  }

  if (query.type) {
    where.type = query.type;
  }

  const movements = await prisma.stockMovement.findMany({
    where,
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
    take: query.limit ?? 50,
    skip: query.offset ?? 0,
  });

  return movements.map(formatStockMovement);
};

export const getMovementStats = async (userId: string) => {
  const restocked = await prisma.stockMovement.aggregate({
    where: { userId, type: 'RESTOCK' },
    _sum: { quantity: true },
  });

  const sold = await prisma.stockMovement.aggregate({
    where: { userId, type: 'SALE' },
    _sum: { quantity: true },
  });

  const adjusted = await prisma.stockMovement.aggregate({
    where: {
      userId,
      type: { in: ['ADJUSTMENT_LOSS', 'ADJUSTMENT_GAIN'] },
    },
    _sum: { quantity: true },
  });

  return {
    totalRestocked: restocked._sum.quantity ?? 0,
    totalSold: sold._sum.quantity ?? 0,
    totalAdjusted: adjusted._sum.quantity ?? 0,
  };
};
