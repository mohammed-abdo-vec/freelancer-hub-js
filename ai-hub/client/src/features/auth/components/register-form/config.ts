import * as z from 'zod';

// Mirrors the server rules for POST /auth/register (name 1–80, valid email, password ≥ 8)
export const registerFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(80, 'Name must be at most 80 characters'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormSchema = z.infer<typeof registerFormSchema>;
