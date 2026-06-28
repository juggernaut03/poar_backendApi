import mongoose from 'mongoose';

// One day from the Amazon "Sales Dashboard" export (aggregate revenue).
const dailySalesSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, unique: true, index: true },
    sales: { type: Number, default: 0 }, // Ordered product sales (current year)
    units: { type: Number, default: 0 }, // Units ordered (current year)
    salesPrevYear: { type: Number, default: 0 }, // Same day one year ago
    unitsPrevYear: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

dailySalesSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const DailySales = mongoose.model('DailySales', dailySalesSchema);
