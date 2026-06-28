import { Content } from '../models/Content.js';

const KEY = 'finance_settings';
const DEFAULTS = { fxRate: 83 }; // INR per 1 USD

// Read finance settings (with defaults).
export async function getFinanceSettings() {
  const block = await Content.findOne({ key: KEY });
  return { ...DEFAULTS, ...(block?.data || {}) };
}

// Merge-update finance settings.
export async function setFinanceSettings(patch) {
  const current = await getFinanceSettings();
  const data = { ...current, ...patch };
  await Content.findOneAndUpdate(
    { key: KEY },
    { $set: { label: 'Finance Settings', data } },
    { upsert: true, setDefaultsOnInsert: true }
  );
  return data;
}

// Convenience: current INR->USD divisor.
export async function getFxRate() {
  const s = await getFinanceSettings();
  const r = Number(s.fxRate);
  return Number.isFinite(r) && r > 0 ? r : DEFAULTS.fxRate;
}
