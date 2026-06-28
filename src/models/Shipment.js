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
    reference: { type: String, default: '' }, // e.g. Amazon shipment ID
    date: { type: Date, default: () => new Date() },
    totalShippingCost: { type: Number, required: true, min: 0 }, // USD
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
