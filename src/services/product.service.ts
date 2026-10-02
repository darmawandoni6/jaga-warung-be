import { Prisma } from '@prisma/client';
import prisma from '@/config/prisma';
import { Conflict, NotFound } from '@/utils/errors';
import {
  CreateProductInput,
  UpdateProductInput,
  QueryProductInput,
} from '@/schemas/product.schema';

export const formatProduct = (product: any) => ({
  id: product.id,
  userId: product.userId,
  categoryId: product.categoryId,
  categoryName: product.category?.name ?? null,
  barcode: product.barcode,
  name: product.name,
  buyPrice: Number(product.buyPrice),
  sellPrice: Number(product.sellPrice),
  stock: product.stock,
  minStock: product.minStock,
  type: product.type,
  image: product.image,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export const getProducts = async (userId: string, query: QueryProductInput) => {
  const where: Prisma.ProductWhereInput = {
    userId,
  };

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { barcode: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: { name: 'asc' },
  });

  let results = products.map(formatProduct);

  if (query.lowStock === 'true') {
    results = results.filter((p) => p.stock <= p.minStock);
  }

  return results;
};

export const getProductById = async (userId: string, id: string) => {
  const product = await prisma.product.findFirst({
    where: { id, userId },
    include: { category: true },
  });

  if (!product) {
    throw NotFound('Product not found');
  }

  return formatProduct(product);
};

export const getProductByBarcode = async (userId: string, barcode: string) => {
  const product = await prisma.product.findFirst({
    where: { barcode, userId },
    include: { category: true },
  });

  if (!product) {
    throw NotFound(`Product with barcode "${barcode}" not found`);
  }

  return formatProduct(product);
};

export const createProduct = async (userId: string, input: CreateProductInput) => {
  const existingBarcode = await prisma.product.findUnique({
    where: { barcode: input.barcode },
  });

  if (existingBarcode) {
    throw Conflict(`Product with barcode "${input.barcode}" already exists`);
  }

  let typeName = input.type ?? null;
  if (input.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, userId },
    });
    if (!category) {
      throw NotFound('Category not found');
    }
    if (!typeName) {
      typeName = category.name;
    }
  }

  return prisma.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        userId,
        barcode: input.barcode,
        name: input.name,
        buyPrice: input.buyPrice,
        sellPrice: input.sellPrice,
        stock: input.stock,
        minStock: input.minStock,
        type: typeName,
        categoryId: input.categoryId ?? null,
        image: input.image ?? null,
      },
      include: { category: true },
    });

    if (input.stock > 0) {
      await tx.stockMovement.create({
        data: {
          userId,
          productId: newProduct.id,
          productBarcode: newProduct.barcode,
          type: 'RESTOCK',
          quantity: input.stock,
          previousStock: 0,
          finalStock: input.stock,
          totalCost: input.stock * input.buyPrice,
          note: 'Initial stock on product creation',
        },
      });
    }

    return formatProduct(newProduct);
  });
};

export const updateProduct = async (userId: string, id: string, input: UpdateProductInput) => {
  const product = await prisma.product.findFirst({
    where: { id, userId },
  });

  if (!product) {
    throw NotFound('Product not found');
  }

  if (input.barcode && input.barcode !== product.barcode) {
    const existingBarcode = await prisma.product.findUnique({
      where: { barcode: input.barcode },
    });
    if (existingBarcode) {
      throw Conflict(`Product with barcode "${input.barcode}" already exists`);
    }
  }

  let typeName = input.type;
  if (input.categoryId !== undefined) {
    if (input.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: input.categoryId, userId },
      });
      if (!category) {
        throw NotFound('Category not found');
      }
      if (typeName === undefined) {
        typeName = category.name;
      }
    } else {
      input.categoryId = null;
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(input.barcode !== undefined && { barcode: input.barcode }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.buyPrice !== undefined && { buyPrice: input.buyPrice }),
      ...(input.sellPrice !== undefined && { sellPrice: input.sellPrice }),
      ...(input.stock !== undefined && { stock: input.stock }),
      ...(input.minStock !== undefined && { minStock: input.minStock }),
      ...(typeName !== undefined && { type: typeName }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.image !== undefined && { image: input.image }),
    },
    include: { category: true },
  });

  return formatProduct(updated);
};

export const deleteProduct = async (userId: string, id: string) => {
  const product = await prisma.product.findFirst({
    where: { id, userId },
  });

  if (!product) {
    throw NotFound('Product not found');
  }

  await prisma.product.delete({
    where: { id },
  });
};
