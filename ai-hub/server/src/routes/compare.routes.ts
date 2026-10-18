import { Router } from 'express';
import { z } from 'zod';
import { currentUser } from '../middleware/auth.js';
import { parse } from '../middleware/validate.js';
import { PROVIDER_IDS } from '../providers/catalog.js';
import { compare } from '../services/chat.service.js';
import type { CompareResponse } from '../types/api.js';

export const compareRouter = Router();

const schema = z.object({
  prompt: z.string().trim().min(1, 'Prompt cannot be empty').max(32000),
  systemPrompt: z.string().max(8000).optional(),
  targets: z
    .array(z.object({ providerId: z.enum(PROVIDER_IDS), model: z.string().trim().min(1) }))
    .min(1, 'Pick at least one model')
    .max(4, 'You can compare up to 4 models'),
  maxTokens: z.number().int().min(1).max(32000).optional(),
});

compareRouter.post('/', async (req, res) => {
  const body = parse(schema, req.body);
  res.json({ results: await compare(currentUser(req).id, body) } satisfies CompareResponse);
});
