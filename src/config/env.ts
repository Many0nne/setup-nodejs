import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .default('3000')
    .transform((v) => parseInt(v, 10)),
  ACCESS_TOKEN_SECRET: z
    .string()
    .default('default-access-secret-change-1234567890abcdef1234567890abcdef'),
  ACCESS_TOKEN_EXPIRES: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z
    .string()
    .default('default-refresh-secret-change-abcdef1234567890abcdef1234567890'),
  REFRESH_TOKEN_EXPIRES: z.string().default('7d'),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  BCRYPT_SALT_ROUNDS: z
    .string()
    .default('10')
    .transform((v) => parseInt(v, 10)),
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5432/appdb?schema=public')
    .refine((val) => /^\w+:\/\//.test(val), { message: 'DATABASE_URL must be a valid URL' }),
});

export const Env = EnvSchema.parse(process.env);
