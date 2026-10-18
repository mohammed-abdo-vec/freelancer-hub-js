import { Router } from 'express';
import { z } from 'zod';
import { toConnection } from '../db/serializers.js';
import { db } from '../db/store.js';
import { currentUser } from '../middleware/auth.js';
import { parse } from '../middleware/validate.js';
import { PROVIDER_IDS } from '../providers/catalog.js';
import {
  createConnection,
  deleteConnection,
  testConnection,
  updateConnection,
} from '../services/connections.service.js';
import type { TestConnectionResponse } from '../types/api.js';

export const connectionsRouter = Router();

const apiKey = z.string().trim().min(8, 'API key looks too short').max(500);
const label = z.string().trim().max(60);

connectionsRouter.get('/', (req, res) => {
  const user = currentUser(req);
  res.json({ connections: db.data.connections.filter((c) => c.userId === user.id).map(toConnection) });
});

connectionsRouter.post('/', async (req, res) => {
  const body = parse(z.object({ providerId: z.enum(PROVIDER_IDS), apiKey, label: label.optional() }), req.body);
  const record = await createConnection(currentUser(req).id, body.providerId, body.apiKey, body.label);
  res.status(201).json({ connection: toConnection(record) });
});

connectionsRouter.patch('/:id', async (req, res) => {
  const body = parse(z.object({ label: label.optional(), apiKey: apiKey.optional() }), req.body);
  const record = await updateConnection(currentUser(req).id, req.params.id, body);
  res.json({ connection: toConnection(record) });
});

connectionsRouter.delete('/:id', (req, res) => {
  deleteConnection(currentUser(req).id, req.params.id);
  res.status(204).end();
});

connectionsRouter.post('/:id/test', async (req, res) => {
  const result = await testConnection(currentUser(req).id, req.params.id);
  res.json({ ...result, connection: toConnection(result.connection) } satisfies TestConnectionResponse);
});
