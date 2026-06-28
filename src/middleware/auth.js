import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { Admin } from '../models/Admin.js';

export function signToken(admin) {
  return jwt.sign({ sub: admin._id.toString(), role: admin.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

// Protects admin-only routes. Expects `Authorization: Bearer <token>`.
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing authorization token' });

    const payload = jwt.verify(token, config.jwtSecret);
    const admin = await Admin.findById(payload.sub);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive account' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
