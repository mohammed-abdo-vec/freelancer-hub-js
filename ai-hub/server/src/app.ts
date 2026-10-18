import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { authRouter } from './routes/auth.routes.js';
import { compareRouter } from './routes/compare.routes.js';
import { connectionsRouter } from './routes/connections.routes.js';
import { conversationsRouter } from './routes/conversations.routes.js';
import { providersRouter } from './routes/providers.routes.js';
import { usageRouter } from './routes/usage.routes.js';
import type { HealthResponse } from './types/api.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigins }));
  app.use(express.json({ limit: '1mb' }));
  if (env.NODE_ENV !== 'test') app.use(requestLogger);

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      version: '1.0.0',
      time: new Date().toISOString(),
      mockProviderEnabled: env.ENABLE_MOCK_PROVIDER,
    } satisfies HealthResponse);
  });

  app.use('/api/auth', authRouter);
  app.use('/api/providers', requireAuth, providersRouter);
  app.use('/api/connections', requireAuth, connectionsRouter);
  app.use('/api/conversations', requireAuth, conversationsRouter);
  app.use('/api/compare', requireAuth, compareRouter);
  app.use('/api/usage', requireAuth, usageRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
