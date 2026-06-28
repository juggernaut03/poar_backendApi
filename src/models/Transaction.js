import mongoose from 'mongoose';

// One row from the Amazon "Transactions" (Payments) report.
// Net total is AFTER Amazon fees (referral/FBA/storage/etc.) but BEFORE our COGS.
const transactionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    type: { type: String, required: true, index: true }, // Order Payment, Refund, Service Fees, Liquidations, ...
    orderId: { type: String, default: '', index: true },
    productDetails: { type: String, default: '' },

    productCharges: { type: Number, default: 0 }, // Total product charges
    promoRebates: { type: Number, default: 0 }, // Total promotional rebates
    amazonFees: { type: Number, default: 0 }, // Amazon fees (negative)
    other: { type: Number, default: 0 }, // Other (storage etc.)
    total: { type: Number, default: 0 }, // Total (USD) net for this row

    currency: { type: String, default: 'USD' },

    // De-dupe key so re-importing the same report doesn't double-count.
    // Built from date+type+orderId+total in the importer.
    dedupeKey: { type: String, unique: true, index: true },
  },
  { timestamps: true }
);

transactionSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Transaction = mongoose.model('Transaction', transactionSchema);
