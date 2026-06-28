// Import Amazon "All Listings Report" (TSV) into the Product collection.
//
// Usage:  node src/scripts/importListings.js <path-to-tsv> [--replace]
//   --replace  delete all existing products before importing
//
// Mapping decisions (see project history):
//   - title       = first comma-segment of `item-name`
//   - tags        = remaining comma-segments of `item-name` (deduped)
//   - description = `item-description`
//   - price       = `price` (currency USD)
//   - amazonUrl   = https://www.amazon.com/dp/<asin1>
//   - sku         = `seller-sku`  (used as the upsert key)
//   - category    = `zshop-category1` if present, else "General"
//   - isPublished = true for all rows
import fs from 'node:fs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.js';

const file = process.argv[2];
const replace = process.argv.includes('--replace');

if (!file) {
  console.error('Usage: node src/scripts/importListings.js <tsv> [--replace]');
  process.exit(1);
}

function parseTsv(text) {
  // Strip BOM, split into lines, tab-split. Amazon reports are plain TSV
  // (no embedded tabs/newlines inside fields for this report type).
  const clean = text.replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headers = lines[0].split('\t');
  return lines.slice(1).map((line) => {
    const cells = line.split('\t');
    const row = {};
    headers.forEach((h, i) => { row[h] = (cells[i] ?? '').trim(); });
    return row;
  });
}

function mapRow(row) {
  const rawName = row['item-name'] || '';
  const segments = rawName.split(',').map((s) => s.trim()).filter(Boolean);
  const title = segments[0] || row['seller-sku'] || 'Untitled product';

  // Remaining segments become tags (deduped, drop ones equal to the title).
  const tags = [...new Set(segments.slice(1).map((s) => s.toLowerCase()))]
    .filter((t) => t && t !== title.toLowerCase())
    .slice(0, 25);

  const asin = row['asin1'] || '';
  const priceNum = row['price'] ? Number(row['price']) : null;

  return {
    sku: row['seller-sku'] || undefined,
    title,
    shortDescription: segments[1] || '',
    description: row['item-description'] || '',
    amazonUrl: asin ? `https://www.amazon.com/dp/${asin}` : '',
    asin,
    price: Number.isFinite(priceNum) ? priceNum : null,
    mrp: null,
    currency: 'USD',
    category: row['zshop-category1'] || 'General',
    tags,
    images: [],
    isPublished: true,
  };
}

async function run() {
  await connectDB();

  const rows = parseTsv(fs.readFileSync(file, 'utf8'));
  const mapped = rows.map(mapRow).filter((p) => p.amazonUrl); // require an Amazon link

  if (replace) {
    const r = await Product.deleteMany({});
    console.log(`[import] Replace mode: deleted ${r.deletedCount} existing products`);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const p of mapped) {
    try {
      // Upsert by SKU when available so re-running updates rather than duplicates.
      const existing = p.sku ? await Product.findOne({ sku: p.sku }) : null;
      if (existing) {
        Object.assign(existing, p);
        await existing.save();
        updated++;
      } else {
        await Product.create(p);
        created++;
      }
    } catch (err) {
      skipped++;
      console.warn(`[import] Skipped "${p.title}" (${p.sku || 'no-sku'}): ${err.message}`);
    }
  }

  const total = await Product.countDocuments();
  console.log(`[import] Done. created=${created} updated=${updated} skipped=${skipped}`);
  console.log(`[import] Products now in DB: ${total}`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('[import] Failed:', err);
  process.exit(1);
});
