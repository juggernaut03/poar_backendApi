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

// In-memory upload for CSV imports (parsed, not stored to disk).
export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const ok = /\.(csv|tsv|txt)$/i.test(file.originalname) ||
      ['text/csv', 'text/tab-separated-values', 'text/plain', 'application/vnd.ms-excel', 'application/octet-stream'].includes(file.mimetype);
    if (ok) return cb(null, true);
    cb(new Error('Please upload a .csv or .tsv file'));
  },
});
