import { z } from 'zod';

export const transactionItemInputSchema = z.object({
  productBarcode: z.string({ required_error: 'Product barcode is required' }).trim().min(1),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  sellPrice: z.coerce.number().min(0).optional(),
});

export const createTransactionSchema = z.object({
  body: z.object({
    items: z.array(transactionItemInputSchema).min(1, 'Transaction must contain at least 1 item'),
    paymentAmount: z.coerce.number().min(0, 'Payment amount must be >= 0'),
    note: z.string().trim().nullable().optional(),
  }),
});

export const queryTransactionSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.coerce.number().int().positive().default(50).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
  }),
});

export const getTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>['body'];
export type QueryTransactionInput = z.infer<typeof queryTransactionSchema>['query'];
