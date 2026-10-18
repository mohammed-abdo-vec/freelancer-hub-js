import { Router } from 'express';
import { z } from 'zod';
import { currentUser } from '../middleware/auth.js';
import { parse } from '../middleware/validate.js';
import { summarizeUsage } from '../services/usage.service.js';

export const usageRouter = Router();

usageRouter.get('/', (req, res) => {
  const { days } = parse(z.object({ days: z.coerce.number().int().min(1).max(90).default(14) }), req.query);
  res.json({ usage: summarizeUsage(currentUser(req).id, days) });
});
