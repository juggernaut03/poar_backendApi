import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: '' },
    // Short marketing line shown on product cards.
    shortDescription: { type: String, default: '' },

    // Where the storefront "Buy on Amazon" button points.
    amazonUrl: { type: String, required: true, trim: true },

    // Amazon identifiers (from the listings import). `sku` is the upsert key.
    sku: { type: String, default: '', trim: true, index: true },
    asin: { type: String, default: '', trim: true },

    // Display price (informational only — no checkout on our site).
    price: { type: Number, default: null },
    mrp: { type: Number, default: null },
    // Our per-unit cost of goods (COGS) — used for true profit once entered.
    cost: { type: Number, default: null },
    currency: { type: String, default: 'INR' },

    category: { type: String, default: 'General', trim: true, index: true },
    subcategory: { type: String, default: '', trim: true, index: true },
    brand: { type: String, default: '', trim: true },

    // Optional social proof shown on storefront cards (0–5).
    rating: { type: Number, default: null, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },

    // Images are CDN URLs (built from the upload's filename + CDN_BASE_URL).
    images: { type: [String], default: [] },

    tags: { type: [String], default: [] },

    isPublished: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Keep slug in sync with title; ensure uniqueness with a short suffix on collision.
productSchema.pre('validate', async function ensureSlug(next) {
  if (this.isModified('title') || !this.slug) {
    const base = slugify(this.title, { lower: true, strict: true }) || 'product';
    let candidate = base;
    let n = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await mongoose.models.Product.exists({ slug: candidate, _id: { $ne: this._id } })) {
      candidate = `${base}-${n++}`;
    }
    this.slug = candidate;
  }
  next();
});

productSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Product = mongoose.model('Product', productSchema);
