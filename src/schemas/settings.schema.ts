import { z } from 'zod';

export const updateStoreProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Store name cannot be empty').optional(),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
    receiptFooter: z.string().trim().optional(),
  }),
});

export type UpdateStoreProfileInput = z.infer<typeof updateStoreProfileSchema>['body'];
