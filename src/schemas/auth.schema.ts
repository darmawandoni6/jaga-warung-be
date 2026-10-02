import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long'),
    name: z.string().trim().min(1, 'Name cannot be empty').optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password cannot be empty'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
