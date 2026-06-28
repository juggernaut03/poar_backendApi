import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, cb) {
        // Allow same-origin / curl (no origin) and whitelisted origins.
        if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // In dev (and as a fallback in prod) serve uploaded files directly.
  // In production Nginx/CDN typically serves UPLOAD_DIR instead.
  app.use('/uploads', express.static(path.resolve(config.uploadDir)));

  app.get('/health', (req, res) => res.json({ ok: true, service: 'pawar-backend-api' }));

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
