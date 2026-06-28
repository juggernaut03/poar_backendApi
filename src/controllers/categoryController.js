import { Category } from '../models/Category.js';

// ---- Public ----

// GET /api/categories2 — managed category list (with subcategories)
export async function listPublic(req, res) {
  const cats = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  res.json(cats);
}

// ---- Admin ----

export async function adminList(req, res) {
  const cats = await Category.find().sort({ sortOrder: 1, name: 1 });
  res.json(cats);
}

export async function adminCreate(req, res) {
  const cat = await Category.create(req.body);
  res.status(201).json(cat);
}

export async function adminUpdate(req, res) {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Category not found' });
  Object.assign(cat, req.body);
  await cat.save();
  res.json(cat);
}

export async function adminDelete(req, res) {
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Category not found' });
  res.json({ ok: true });
}
