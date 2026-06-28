import { Product } from '../models/Product.js';
import { PurchaseBatch } from '../models/PurchaseBatch.js';
import { Shipment } from '../models/Shipment.js';
import { Overhead } from '../models/Overhead.js';
import { getFxRate } from './settings.js';

// Compute the landed per-unit COGS for every SKU that has cost data.
//
// Landed COGS / unit (USD) =
//   purchase cost / unit  (weighted avg across that SKU's purchase batches)
//   + shipping / unit      (each shipment's cost split across its units BY WEIGHT)
//
// Overhead (rent/packaging) is NOT included per-unit here — it's allocated
// across units sold in the reporting period by the finance controller, because
// it depends on the date range.
//
// Returns: { bySku: { [sku]: { purchasePerUnit, shippingPerUnit, landed, manualOverride } }, ... }
export async function computeLandedCogs() {
  const [products, batches, shipments, fxRate] = await Promise.all([
    Product.find({}).select('sku title weightGrams cost'),
    PurchaseBatch.find({}),
    Shipment.find({}),
    getFxRate(), // INR per USD
  ]);

  const prodBySku = {};
  products.forEach((p) => { if (p.sku) prodBySku[p.sku] = p; });

  // 1) Weighted-average purchase cost per unit, per SKU.
  const purchase = {}; // sku -> { qty, cost }
  for (const b of batches) {
    if (!purchase[b.sku]) purchase[b.sku] = { qty: 0, cost: 0 };
    purchase[b.sku].qty += b.quantity;
    purchase[b.sku].cost += b.totalCost;
  }

  // 2) Shipping per unit, per SKU — split each shipment by weight.
  const ship = {}; // sku -> { weightedUnits, costShare, units }
  for (const s of shipments) {
    // total weight units in this shipment = Σ (product weight × units)
    let totalWeighted = 0;
    const lineWeights = [];
    for (const line of s.lines) {
      const w = prodBySku[line.sku]?.weightGrams || 0;
      // Fall back to weight=1 so a shipment with no weights splits evenly.
      const effW = w > 0 ? w : 1;
      const weighted = effW * line.units;
      lineWeights.push({ sku: line.sku, units: line.units, weighted });
      totalWeighted += weighted;
    }
    if (totalWeighted <= 0) continue;
    for (const lw of lineWeights) {
      const share = (lw.weighted / totalWeighted) * s.totalShippingCost;
      if (!ship[lw.sku]) ship[lw.sku] = { costShare: 0, units: 0 };
      ship[lw.sku].costShare += share;
      ship[lw.sku].units += lw.units;
    }
  }

  const bySku = {};
  const allSkus = new Set([...Object.keys(purchase), ...Object.keys(ship), ...products.map((p) => p.sku).filter(Boolean)]);
  for (const sku of allSkus) {
    // Purchase & shipping are stored in INR — convert to USD via the rate.
    const ppInr = purchase[sku] && purchase[sku].qty ? purchase[sku].cost / purchase[sku].qty : null;
    const spInr = ship[sku] && ship[sku].units ? ship[sku].costShare / ship[sku].units : null;
    const pp = ppInr != null ? ppInr / fxRate : null;
    const sp = spInr != null ? spInr / fxRate : null;
    const manual = prodBySku[sku]?.cost ?? null; // manual override is already in USD

    let landed = null;
    if (manual != null) {
      landed = manual; // explicit override wins
    } else if (pp != null || sp != null) {
      landed = (pp || 0) + (sp || 0);
    }

    bySku[sku] = {
      purchasePerUnit: pp != null ? round(pp) : null,
      shippingPerUnit: sp != null ? round(sp) : null,
      purchasePerUnitInr: ppInr != null ? round(ppInr) : null,
      shippingPerUnitInr: spInr != null ? round(spInr) : null,
      manualOverride: manual,
      landed: landed != null ? round(landed) : null,
      hasData: pp != null || sp != null || manual != null,
    };
  }
  return bySku;
}

// Total overhead within [from,to] (inclusive), converted INR -> USD.
export async function overheadInRange(from, to) {
  const f = {};
  if (from) f.$gte = new Date(from);
  if (to) f.$lte = new Date(to);
  const match = Object.keys(f).length ? { date: f } : {};
  const [rows, fxRate] = await Promise.all([
    Overhead.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    getFxRate(),
  ]);
  const inr = rows[0]?.total || 0;
  return inr / fxRate; // USD
}

function round(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
