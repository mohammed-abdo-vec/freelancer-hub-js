import { env } from './config/env.js';
import { createApp } from './app.js';
import { db } from './db/store.js';

const server = createApp().listen(env.PORT, () => {
  console.log(`AI Hub API listening on http://localhost:${env.PORT}`);
  console.log(`  CORS origin(s): ${env.clientOrigins.join(', ')}`);
  console.log(`  Mock provider:  ${env.ENABLE_MOCK_PROVIDER ? 'enabled' : 'disabled'}`);
});

async function shutdown() {
  server.close();
  await db.flush();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
