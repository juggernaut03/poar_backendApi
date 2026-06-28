// Apply COGS_MAP costs to catalog products (matched by SKU).
// Usage: node src/scripts/applyCogs.js
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.js';
import { COGS_MAP } from '../config/cogsMap.js';

async function run() {
  await connectDB();

  // De-dupe SKUs (the map may have several prefixes pointing to one SKU).
  const bySku = new Map();
  for (const m of COGS_MAP) {
    if (m.sku) bySku.set(m.sku, m.cost);
  }

  let updated = 0;
  for (const [sku, cost] of bySku) {
    const res = await Product.updateOne({ sku }, { $set: { cost } });
    if (res.matchedCount) {
      updated++;
      console.log(`[cogs] ${sku} -> cost $${cost}`);
    } else {
      console.warn(`[cogs] No catalog product with sku=${sku} (cost will still apply via name mapping)`);
    }
  }

  console.log(`[cogs] Updated ${updated} catalog products`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('[cogs] Failed:', err);
  process.exit(1);
});
