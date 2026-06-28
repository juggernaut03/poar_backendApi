import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import multer from 'multer';
import { config } from '../config/env.js';

// Ensure the upload directory exists on the VPS disk.
const uploadDir = path.resolve(config.uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, name);
  },
});

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) return cb(null, true);
    cb(new Error('Unsupported file type. Use JPG, PNG, WEBP, GIF or AVIF.'));
  },
});

// Build the public CDN URL the storefront/admin will use for a stored file.
export function cdnUrl(filename) {
  return `${config.cdnBaseUrl}/${filename}`;
}
