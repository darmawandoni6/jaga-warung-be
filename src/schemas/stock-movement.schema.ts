import { z } from 'zod';

export const restockSchema = z.object({
  body: z.object({
    productBarcode: z.string({ required_error: 'Product barcode is required' }).trim().min(1),
    quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
    buyPrice: z.coerce.number().min(0).optional(),
    recordToCashFlow: z.boolean().default(true),
    note: z.string().trim().optional(),
  }),
});

export const adjustStockSchema = z.object({
  body: z.object({
    productBarcode: z.string({ required_error: 'Product barcode is required' }).trim().min(1),
    type: z.enum(['ADJUSTMENT_LOSS', 'ADJUSTMENT_GAIN', 'adjustment_loss', 'adjustment_gain'], {
      required_error: 'Adjustment type must be ADJUSTMENT_LOSS or ADJUSTMENT_GAIN',
    }),
    quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
    reason: z
      .string({ required_error: 'Reason is required' })
      .trim()
      .min(1, 'Reason cannot be empty'),
  }),
});

export const queryStockMovementSchema = z.object({
  query: z.object({
    productBarcode: z.string().optional(),
    type: z.enum(['RESTOCK', 'SALE', 'ADJUSTMENT_LOSS', 'ADJUSTMENT_GAIN']).optional(),
    limit: z.coerce.number().int().positive().default(50).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
  }),
});

export type RestockInput = z.infer<typeof restockSchema>['body'];
export type AdjustStockInput = z.infer<typeof adjustStockSchema>['body'];
export type QueryStockMovementInput = z.infer<typeof queryStockMovementSchema>['query'];
