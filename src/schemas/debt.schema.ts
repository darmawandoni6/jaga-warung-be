import { z } from 'zod';

export const createDebtSchema = z.object({
  body: z.object({
    customerName: z
      .string({ required_error: 'Customer name is required' })
      .trim()
      .min(1, 'Customer name cannot be empty'),
    phone: z.string().trim().nullable().optional(),
    totalDebt: z.coerce.number().positive('Total debt must be greater than 0'),
    paidAmount: z.coerce.number().min(0).default(0),
    note: z.string().trim().nullable().optional(),
  }),
});

export const recordDebtPaymentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid debt ID'),
  }),
  body: z.object({
    amount: z.coerce.number().positive('Payment amount must be greater than 0'),
    note: z.string().trim().nullable().optional(),
  }),
});

export const updateDebtStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid debt ID'),
  }),
  body: z.object({
    status: z.enum(
      ['ACTIVE', 'PARTIAL', 'PAID', 'BAD_DEBT', 'active', 'partial', 'paid', 'bad_debt'],
      { required_error: 'Status must be ACTIVE, PARTIAL, PAID, or BAD_DEBT' }
    ),
  }),
});

export const queryDebtSchema = z.object({
  query: z.object({
    status: z.enum(['ACTIVE', 'PARTIAL', 'PAID', 'BAD_DEBT']).optional(),
    search: z.string().optional(),
    limit: z.coerce.number().int().positive().default(50).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
  }),
});

export const getDebtByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid debt ID'),
  }),
});

export type CreateDebtInput = z.infer<typeof createDebtSchema>['body'];
export type RecordDebtPaymentInput = z.infer<typeof recordDebtPaymentSchema>['body'];
export type UpdateDebtStatusInput = z.infer<typeof updateDebtStatusSchema>['body'];
export type QueryDebtInput = z.infer<typeof queryDebtSchema>['query'];
