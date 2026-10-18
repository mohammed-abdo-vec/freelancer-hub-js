import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16).default('dev-only-jwt-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ENCRYPTION_KEY: z.string().min(16).default('dev-only-encryption-key-change-me'),
  DATA_FILE: z.string().default('./data/db.json'),
  ENABLE_MOCK_PROVIDER: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:');
  for (const issue of parsed.error.issues) console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
  clientOrigins: parsed.data.CLIENT_ORIGIN.split(',').map((o) => o.trim()),
};

if (env.isProduction && (env.JWT_SECRET.startsWith('dev-only') || env.ENCRYPTION_KEY.startsWith('dev-only'))) {
  console.error('JWT_SECRET and ENCRYPTION_KEY must be set in production.');
  process.exit(1);
}
