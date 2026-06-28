import { Product } from '../models/Product.js';

// ---- Public ----

// GET /api/products  (storefront) — published only, with filtering & paging.
export async function listPublic(req, res) {
  const { category, subcategory, q, featured, page = 1, limit = 24 } = req.query;
  const filter = { isPublished: true };
  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;
  if (featured === 'true') filter.isFeatured = true;
  if (q) filter.$or = [
    { title: new RegExp(q, 'i') },
    { tags: new RegExp(q, 'i') },
    { brand: new RegExp(q, 'i') },
  ];

  const pageNum = Math.max(1, parseInt(page, 10));
  const perPage = Math.min(60, Math.max(1, parseInt(limit, 10)));

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((pageNum - 1) * perPage)
      .limit(perPage),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / perPage) });
}

// GET /api/products/:slug  (storefront)
export async function getBySlug(req, res) {
  const product = await Product.findOne({ slug: req.params.slug, isPublished: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
}

// GET /api/categories  (storefront) — distinct published categories
export async function listCategories(req, res) {
  const cats = await Product.distinct('category', { isPublished: true });
  res.json(cats.filter(Boolean).sort());
}

// ---- Admin ----

// GET /api/admin/products — all products (any status)
export async function adminList(req, res) {
  const { q } = req.query;
  const filter = {};
  if (q) filter.title = new RegExp(q, 'i');
  const items = await Product.find(filter).sort({ sortOrder: 1, createdAt: -1 });
  res.json({ items, total: items.length });
}

export async function adminGet(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
}

export async function adminCreate(req, res) {
  const product = await Product.create(req.body);
  res.status(201).json(product);
}

export async function adminUpdate(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  Object.assign(product, req.body);
  await product.save();
  res.json(product);
}

export async function adminDelete(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ ok: true });
}
