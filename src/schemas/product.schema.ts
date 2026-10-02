import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    barcode: z
      .string({ required_error: 'Barcode is required' })
      .trim()
      .min(1, 'Barcode cannot be empty'),
    name: z
      .string({ required_error: 'Product name is required' })
      .trim()
      .min(1, 'Product name cannot be empty'),
    buyPrice: z.coerce.number().min(0, 'Buy price must be >= 0').default(0),
    sellPrice: z.coerce.number().min(0, 'Sell price must be >= 0').default(0),
    stock: z.coerce.number().int().min(0, 'Stock must be >= 0').default(0),
    minStock: z.coerce.number().int().min(0, 'Min stock must be >= 0').default(0),
    type: z.string().trim().nullable().optional(),
    categoryId: z.string().uuid('Invalid category ID').nullable().optional(),
    image: z.string().nullable().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    barcode: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    buyPrice: z.coerce.number().min(0).optional(),
    sellPrice: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    minStock: z.coerce.number().int().min(0).optional(),
    type: z.string().trim().nullable().optional(),
    categoryId: z.string().uuid().nullable().optional(),
    image: z.string().nullable().optional(),
  }),
});

export const getProductByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

export const getProductByBarcodeSchema = z.object({
  params: z.object({
    barcode: z.string().min(1, 'Barcode parameter is required'),
  }),
});

export const queryProductSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    lowStock: z.enum(['true', 'false']).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type QueryProductInput = z.infer<typeof queryProductSchema>['query'];
