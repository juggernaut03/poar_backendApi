// Classify all products into category + subcategory using the taxonomy,
// and seed the Category collection so the admin/storefront have a managed list.
//
// Usage: node src/scripts/classifyProducts.js [--dry]
//   --dry  print the classification distribution without writing products
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { TAXONOMY, classify } from '../config/taxonomy.js';

const dry = process.argv.includes('--dry');

async function run() {
  await connectDB();

  // 1) Seed/refresh the managed Category collection from the taxonomy.
  if (!dry) {
    for (let i = 0; i < TAXONOMY.length; i++) {
      const cat = TAXONOMY[i];
      const subs = cat.subcategories.map((s) => s.name);
      await Category.findOneAndUpdate(
        { name: cat.name },
        { $set: { subcategories: subs, sortOrder: i, isActive: true } },
        { upsert: true, setDefaultsOnInsert: true, new: true }
      );
    }
    console.log(`[classify] Seeded ${TAXONOMY.length} categories`);
  }

  // 2) Classify every product.
  const products = await Product.find();
  const dist = {};
  let changed = 0;

  for (const p of products) {
    const { category, subcategory } = classify(p.title, p.tags || []);
    const key = `${category} › ${subcategory}`;
    dist[key] = (dist[key] || 0) + 1;

    if (!dry && (p.category !== category || p.subcategory !== subcategory)) {
      p.category = category;
      p.subcategory = subcategory;
      await p.save();
      changed++;
    }
  }

  console.log('\n[classify] Distribution:');
  Object.entries(dist)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(3)}  ${k}`));

  console.log(`\n[classify] ${dry ? 'DRY RUN — no changes' : `Updated ${changed} products`}`);
  console.log(`[classify] Total products: ${products.length}`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('[classify] Failed:', err);
  process.exit(1);
});
