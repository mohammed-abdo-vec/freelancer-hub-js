import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { toUser } from '../db/serializers.js';
import { db } from '../db/store.js';
import { AppError } from '../lib/errors.js';
import { signToken } from '../lib/jwt.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { currentUser, requireAuth } from '../middleware/auth.js';
import { parse } from '../middleware/validate.js';
import type { AuthResponse } from '../types/api.js';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, next) => next(new AppError(429, 'RATE_LIMITED', 'Too many attempts. Try again in a few minutes.')),
});

const email = z.email('Enter a valid email address').trim().toLowerCase();

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email,
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

authRouter.post('/register', authLimiter, async (req, res) => {
  const body = parse(registerSchema, req.body);
  if (db.data.users.some((u) => u.email === body.email)) {
    throw new AppError(409, 'CONFLICT', 'An account with this email already exists.');
  }
  const user = {
    id: randomUUID(),
    name: body.name,
    email: body.email,
    passwordHash: await hashPassword(body.password),
    createdAt: new Date().toISOString(),
  };
  db.write((d) => d.users.push(user));
  res.status(201).json({ token: signToken(user.id), user: toUser(user) } satisfies AuthResponse);
});

authRouter.post('/login', authLimiter, async (req, res) => {
  const body = parse(loginSchema, req.body);
  const user = db.data.users.find((u) => u.email === body.email);
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    // Same message for both cases so emails can't be enumerated.
    throw new AppError(401, 'UNAUTHORIZED', 'Incorrect email or password.');
  }
  res.json({ token: signToken(user.id), user: toUser(user) } satisfies AuthResponse);
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: toUser(currentUser(req)) });
});

authRouter.patch('/me', requireAuth, (req, res) => {
  const { name } = parse(z.object({ name: z.string().trim().min(1, 'Name is required').max(80) }), req.body);
  const user = currentUser(req);
  db.write(() => {
    user.name = name;
  });
  res.json({ user: toUser(user) });
});
