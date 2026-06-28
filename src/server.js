import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

async function start() {
  try {
    await connectDB();
    const app = createApp();
    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] Pawar API listening on http://localhost:${config.port} (${config.nodeEnv})`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();
