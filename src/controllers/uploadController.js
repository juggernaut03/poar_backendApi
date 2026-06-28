import { cdnUrl } from '../middleware/upload.js';

// POST /api/admin/uploads — accepts one or many files under field "files"
export async function uploadFiles(req, res) {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'No files uploaded' });
  const urls = files.map((f) => cdnUrl(f.filename));
  res.status(201).json({ urls });
}
