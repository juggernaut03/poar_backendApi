import mongoose from 'mongoose';

// A bulk purchase of one product: quantity bought for a total cost.
// Per-unit purchase cost = totalCost / quantity. All amounts in USD.
const purchaseBatchSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, index: true, trim: true },
    productTitle: { type: String, default: '' }, // snapshot for display
    quantity: { type: Number, required: true, min: 1 },
    totalCost: { type: Number, required: true, min: 0 }, // USD
    date: { type: Date, default: () => new Date() },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

purchaseBatchSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const PurchaseBatch = mongoose.model('PurchaseBatch', purchaseBatchSchema);
