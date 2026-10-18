import type { z } from 'zod';
import { AppError } from '../lib/errors.js';

/** Parse a request body/query with a zod schema, or throw a 400 with per-field details. */
export function parse<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  const details = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  const first = details[0];
  throw new AppError(
    400,
    'VALIDATION_ERROR',
    first ? `${first.path ? `${first.path}: ` : ''}${first.message}` : 'Invalid request',
    details,
  );
}
