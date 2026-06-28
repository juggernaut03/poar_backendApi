import { Admin } from '../models/Admin.js';
import { signToken } from '../middleware/auth.js';

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
  if (!admin || !admin.isActive || !(await admin.verifyPassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = signToken(admin);
  res.json({ token, admin });
}

export async function me(req, res) {
  res.json({ admin: req.admin });
}
