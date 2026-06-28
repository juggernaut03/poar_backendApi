import mongoose from 'mongoose';

// An inbound shipment to Amazon: a set of products (by SKU + units) sent for a
// total shipping cost. The cost is split across units BY WEIGHT (product
// weightGrams × units), computed in the finance service. All amounts in USD.
const shipmentLineSchema = new mongoose.Schema(
  { sku: { type: String, required: true, trim: true }, units: { type: Number, required: true, min: 1 } },
  { _id: false }
);

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: { type: String, default: '', index: true }, // FBA shipment ID, e.g. FBA1949Z2RJ7
    name: { type: String, default: '' }, // FBA shipment name
    reference: { type: String, default: '' }, // legacy / manual reference
    date: { type: Date, default: () => new Date() },
    totalShippingCost: { type: Number, default: 0, min: 0 }, // USD (may be 0 until cost is known)
    lines: { type: [shipmentLineSchema], default: [] },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

shipmentSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Shipment = mongoose.model('Shipment', shipmentSchema);
