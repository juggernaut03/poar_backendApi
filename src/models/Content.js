import mongoose from 'mongoose';

// A flexible CMS block keyed by `key` (e.g. "home_hero", "about", "footer",
// "contact"). `data` holds arbitrary JSON so the admin CMS can manage varied
// sections without schema migrations.
const contentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true, trim: true },
    label: { type: String, default: '' },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

contentSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Content = mongoose.model('Content', contentSchema);
