import { Prisma } from '@prisma/client';
import prisma from '@/config/prisma';
import { Conflict, NotFound } from '@/utils/errors';

export const DEFAULT_CATEGORIES = ['Makanan', 'Minuman', 'Sembako', 'Rokok', 'Lainnya'];

export interface CategoryWithCountResponse {
  id: string;
  name: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const seedDefaultCategories = async (
  userId: string,
  tx?: Prisma.TransactionClient
): Promise<void> => {
  const db = tx ?? prisma;
  for (const name of DEFAULT_CATEGORIES) {
    await db.category.upsert({
      where: {
        userId_name: {
          userId,
          name,
        },
      },
      update: {},
      create: {
        userId,
        name,
      },
    });
  }
};

export const getCategories = async (userId: string): Promise<CategoryWithCountResponse[]> => {
  const categories = await prisma.category.findMany({
    where: { userId },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    productCount: c._count.products,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
};

export const getCategoryById = async (
  userId: string,
  categoryId: string
): Promise<CategoryWithCountResponse> => {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    throw NotFound('Category not found');
  }

  return {
    id: category.id,
    name: category.name,
    productCount: category._count.products,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

export const createCategory = async (userId: string, name: string) => {
  const existing = await prisma.category.findUnique({
    where: {
      userId_name: {
        userId,
        name,
      },
    },
  });

  if (existing) {
    throw Conflict(`Category "${name}" already exists`);
  }

  return prisma.category.create({
    data: {
      userId,
      name,
    },
  });
};

export const updateCategory = async (userId: string, categoryId: string, name: string) => {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) {
    throw NotFound('Category not found');
  }

  const existingName = await prisma.category.findUnique({
    where: {
      userId_name: {
        userId,
        name,
      },
    },
  });

  if (existingName && existingName.id !== categoryId) {
    throw Conflict(`Category "${name}" already exists`);
  }

  return prisma.category.update({
    where: { id: categoryId },
    data: { name },
  });
};

export const deleteCategory = async (userId: string, categoryId: string) => {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) {
    throw NotFound('Category not found');
  }

  return prisma.category.delete({
    where: { id: categoryId },
  });
};
