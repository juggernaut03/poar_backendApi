import { Content } from '../models/Content.js';

// ---- Public ----

// GET /api/content/:key — fetch a single CMS block for the storefront
export async function getPublic(req, res) {
  const block = await Content.findOne({ key: req.params.key });
  if (!block) return res.json({ key: req.params.key, data: {} });
  res.json(block);
}

// GET /api/content — all blocks (storefront can hydrate everything at once)
export async function listPublic(req, res) {
  const blocks = await Content.find().sort({ key: 1 });
  res.json(blocks);
}

// ---- Admin ----

export async function adminList(req, res) {
  const blocks = await Content.find().sort({ key: 1 });
  res.json(blocks);
}

// PUT /api/admin/content/:key — upsert a CMS block
export async function adminUpsert(req, res) {
  const { label, data } = req.body || {};
  const block = await Content.findOneAndUpdate(
    { key: req.params.key },
    { $set: { label: label ?? '', data: data ?? {} } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json(block);
}

export async function adminDelete(req, res) {
  await Content.findOneAndDelete({ key: req.params.key });
  res.json({ ok: true });
}
