import type { NextFunction, Request, Response } from 'express';
import { db, type UserRecord } from '../db/store.js';
import { AppError } from '../lib/errors.js';
import { verifyToken } from '../lib/jwt.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserRecord;
    }
  }
}

/** Requires `Authorization: Bearer <jwt>`; attaches `req.user`. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  const user = payload ? db.data.users.find((u) => u.id === payload.sub) : undefined;
  if (!user) return next(new AppError(401, 'UNAUTHORIZED', 'Your session has expired. Please sign in again.'));
  req.user = user;
  next();
}

/** For handlers behind `requireAuth`. */
export function currentUser(req: Request): UserRecord {
  if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not signed in');
  return req.user;
}
