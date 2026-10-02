import { z } from 'zod';

export const createCashFlowSchema = z.object({
  body: z.object({
    type: z.enum(['INCOME', 'EXPENSE', 'income', 'expense'], {
      required_error: 'Cash flow type must be INCOME or EXPENSE',
    }),
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    note: z.string().trim().default(''),
    date: z.string().optional(),
  }),
});

export const queryCashFlowSchema = z.object({
  query: z.object({
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.coerce.number().int().positive().default(50).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
  }),
});

export const getCashFlowByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid cash flow ID'),
  }),
});

export type CreateCashFlowInput = z.infer<typeof createCashFlowSchema>['body'];
export type QueryCashFlowInput = z.infer<typeof queryCashFlowSchema>['query'];
