import { Router } from 'express';
import { z } from 'zod';
import { toConnection } from '../db/serializers.js';
import { db } from '../db/store.js';
import { notFound } from '../lib/errors.js';
import { currentUser } from '../middleware/auth.js';
import { parse } from '../middleware/validate.js';
import { PROVIDER_IDS, getProviderMeta, listProviderMeta } from '../providers/catalog.js';
import { listModels } from '../services/connections.service.js';
import type { Provider } from '../types/api.js';

export const providersRouter = Router();

providersRouter.get('/', (req, res) => {
  const user = currentUser(req);
  const providers: Provider[] = listProviderMeta().map((meta) => {
    const connection = db.data.connections.find((c) => c.userId === user.id && c.providerId === meta.id);
    return { ...meta, connection: connection ? toConnection(connection) : null };
  });
  res.json({ providers });
});

providersRouter.get('/:providerId/models', async (req, res) => {
  const providerId = parse(z.enum(PROVIDER_IDS), req.params.providerId);
  if (!getProviderMeta(providerId)) throw notFound('Provider');
  res.json({ models: await listModels(currentUser(req).id, providerId) });
});
