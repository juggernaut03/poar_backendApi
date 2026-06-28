import mongoose from 'mongoose';

// A recurring or one-off overhead cost (rent, packaging, utilities, etc.).
// Allocated across units sold in the reporting period. All amounts in USD.
const overheadSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "Shop rent", "Packaging"
    amount: { type: Number, required: true, min: 0 }, // USD
    // Period this overhead applies to (month). For a monthly rent, set the
    // first of the month; the allocator counts it within any range that overlaps.
    date: { type: Date, required: true },
    recurring: { type: Boolean, default: false }, // informational
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

overheadSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Overhead = mongoose.model('Overhead', overheadSchema);
