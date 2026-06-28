// Import finance CSVs into the DB.
//
// Usage:
//   node src/scripts/importFinance.js --transactions <file.csv>
//   node src/scripts/importFinance.js --sales <file.csv>
//   (either or both flags may be given)
import fs from 'node:fs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { importTransactions, importDailySales } from '../controllers/financeController.js';

function argFor(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : null;
}

async function run() {
  const txFile = argFor('--transactions');
  const salesFile = argFor('--sales');
  if (!txFile && !salesFile) {
    console.error('Usage: importFinance.js [--transactions <csv>] [--sales <csv>]');
    process.exit(1);
  }

  await connectDB();

  if (txFile) {
    const r = await importTransactions(fs.readFileSync(txFile, 'utf8'));
    console.log(`[finance] Transactions: parsed=${r.parsed} created=${r.created} skipped(dupe)=${r.skipped}`);
  }
  if (salesFile) {
    const r = await importDailySales(fs.readFileSync(salesFile, 'utf8'));
    console.log(`[finance] Daily sales: parsed=${r.parsed} upserted=${r.upserted}`);
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('[finance] Failed:', err);
  process.exit(1);
});
