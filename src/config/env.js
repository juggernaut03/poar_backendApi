import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`[config] Warning: ${key} is not set. Check your .env file.`);
  }
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawar_online',
  jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  cdnBaseUrl: (process.env.CDN_BASE_URL || 'http://localhost:4000/uploads').replace(/\/$/, ''),
  seed: {
    email: process.env.SEED_ADMIN_EMAIL || 'admin@pawaronline.in',
    password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
    name: process.env.SEED_ADMIN_NAME || 'Administrator',
  },
};
