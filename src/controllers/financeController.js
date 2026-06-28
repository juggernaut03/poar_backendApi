import { Transaction } from '../models/Transaction.js';
import { DailySales } from '../models/DailySales.js';
import { parseTransactions, parseSalesDashboard } from '../utils/financeParsers.js';
import { resolveCogs } from '../config/cogsMap.js';
import { computeLandedCogs, overheadInRange } from '../utils/landedCogs.js';

// Amazon reserve/balance movements are not income or expense — they shift
// held funds between statements and net to zero. Exclude from P&L.
const RESERVE_TYPES = ['Unavailable balance', "Previous statement's unavailable balance"];

// ---- Import helpers (used by both upload endpoint and seed script) ----

export async function importTransactions(text) {
  const rows = parseTransactions(text);
  let created = 0;
  let skipped = 0;
  for (const r of rows) {
    try {
      const res = await Transaction.updateOne(
        { dedupeKey: r.dedupeKey },
        { $setOnInsert: r },
        { upsert: true }
      );
      if (res.upsertedCount) created++; else skipped++;
    } catch {
      skipped++;
    }
  }
  return { parsed: rows.length, created, skipped };
}

export async function importDailySales(text) {
  const rows = parseSalesDashboard(text);
  let upserted = 0;
  for (const r of rows) {
    await DailySales.updateOne({ date: r.date }, { $set: r }, { upsert: true });
    upserted++;
  }
  return { parsed: rows.length, upserted };
}

// ---- Date-range helper ----
function rangeFilter(query) {
  const f = {};
  if (query.from) f.$gte = new Date(query.from);
  if (query.to) f.$lte = new Date(query.to);
  return Object.keys(f).length ? { date: f } : {};
}

// GET /api/admin/finance/summary — P&L summary cards
export async function summary(req, res) {
  const match = { ...rangeFilter(req.query), type: { $nin: RESERVE_TYPES } };

  const txAgg = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$total' },
        fees: { $sum: '$amazonFees' },
        productCharges: { $sum: '$productCharges' },
        count: { $sum: 1 },
      },
    },
  ]);

  const byType = {};
  let netProceeds = 0;
  let totalFees = 0;
  for (const r of txAgg) {
    byType[r._id] = { total: round(r.total), count: r.count };
    netProceeds += r.total;
    totalFees += r.fees;
  }

  const grossSales = byType['Order Payment']?.total || 0;
  const refunds = byType['Refund']?.total || 0;
  const serviceFees = byType['Service Fees']?.total || 0;
  const liquidations = byType['Liquidations']?.total || 0;
  const reimbursements = byType['Inventory Reimbursement']?.total || 0;

  // Actual coverage of imported transaction data (so the period is always clear).
  const [first, last] = await Promise.all([
    Transaction.findOne(match).sort({ date: 1 }).select('date'),
    Transaction.findOne(match).sort({ date: -1 }).select('date'),
  ]);

  res.json({
    range: { from: req.query.from || null, to: req.query.to || null },
    coverage: {
      from: first?.date?.toISOString().slice(0, 10) || null,
      to: last?.date?.toISOString().slice(0, 10) || null,
    },
    currency: 'USD',
    grossSales: round(grossSales),
    refunds: round(refunds),
    amazonFees: round(totalFees),
    serviceFees: round(serviceFees),
    liquidations: round(liquidations),
    reimbursements: round(reimbursements),
    netProceeds: round(netProceeds), // after Amazon fees, before COGS
    byType,
    transactionCount: txAgg.reduce((s, r) => s + r.count, 0),
  });
}

// GET /api/admin/finance/sales-trend — daily/monthly sales series
export async function salesTrend(req, res) {
  const match = rangeFilter(req.query);
  const groupBy = req.query.group === 'month'
    ? { y: { $year: '$date' }, m: { $month: '$date' } }
    : null;

  if (groupBy) {
    const rows = await DailySales.aggregate([
      { $match: match },
      { $group: { _id: groupBy, sales: { $sum: '$sales' }, units: { $sum: '$units' }, salesPrevYear: { $sum: '$salesPrevYear' } } },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]);
    return res.json(rows.map((r) => ({
      label: `${r._id.y}-${String(r._id.m).padStart(2, '0')}`,
      sales: round(r.sales), units: r.units, salesPrevYear: round(r.salesPrevYear),
    })));
  }

  const rows = await DailySales.find(match).sort({ date: 1 });
  res.json(rows.map((r) => ({
    label: r.date.toISOString().slice(0, 10),
    sales: r.sales, units: r.units, salesPrevYear: r.salesPrevYear, unitsPrevYear: r.unitsPrevYear,
  })));
}

// GET /api/admin/finance/top-products — rank by net from Order Payments
export async function topProducts(req, res) {
  const match = { ...rangeFilter(req.query), type: 'Order Payment' };
  const limit = Math.min(50, parseInt(req.query.limit || '10', 10));
  const rows = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$productDetails',
        net: { $sum: '$total' },
        gross: { $sum: '$productCharges' },
        fees: { $sum: '$amazonFees' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { net: -1 } },
    { $limit: limit },
  ]);
  res.json(rows.map((r) => {
    const info = resolveCogs(r._id || '');
    return {
      product: info?.label || (r._id || 'Unknown').replace(/,.*$/, '').replace(/\.\.\.$/, '').trim(),
      sku: info?.sku || null,
      net: round(r.net), gross: round(r.gross), fees: round(r.fees), orders: r.orders,
    };
  }));
}

// GET /api/admin/finance/transactions — paginated raw list
export async function listTransactions(req, res) {
  const match = rangeFilter(req.query);
  if (req.query.type) match.type = req.query.type;
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(200, parseInt(req.query.limit || '50', 10));
  const [items, total] = await Promise.all([
    Transaction.find(match).sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
    Transaction.countDocuments(match),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}

// GET /api/admin/finance/profit — true net profit (after Amazon fees AND COGS)
export async function profit(req, res) {
  const base = rangeFilter(req.query);

  // Per-product: paid orders + net, and refund orders + net.
  const [paid, refunds] = await Promise.all([
    Transaction.aggregate([
      { $match: { ...base, type: 'Order Payment' } },
      { $group: { _id: '$productDetails', orders: { $sum: 1 }, net: { $sum: '$total' }, fees: { $sum: '$amazonFees' } } },
    ]),
    Transaction.aggregate([
      { $match: { ...base, type: 'Refund' } },
      { $group: { _id: '$productDetails', orders: { $sum: 1 }, net: { $sum: '$total' } } },
    ]),
  ]);

  const refMap = {};
  refunds.forEach((r) => { refMap[r._id] = r; });

  // Landed COGS per SKU (purchase + weight-allocated shipping, or manual override).
  const landed = await computeLandedCogs();

  const products = [];
  let totalProfit = 0;
  let totalCogs = 0;
  let totalNetAfterAmazon = 0;
  let totalUnitsKept = 0;
  let unmapped = 0;

  for (const p of paid) {
    const ref = refMap[p._id] || { orders: 0, net: 0 };
    const cogsInfo = resolveCogs(p._id);
    const unitsKept = Math.max(0, p.orders - ref.orders); // units customers kept
    const netAfterAmazon = p.net + ref.net; // Amazon net incl. refunds
    const cogsPerUnit = cogsInfo?.sku != null ? (landed[cogsInfo.sku]?.landed ?? null) : null;
    const cogsTotal = cogsPerUnit != null ? unitsKept * cogsPerUnit : null;
    const productProfit = cogsTotal != null ? netAfterAmazon - cogsTotal : null;

    if (cogsPerUnit == null) unmapped++;
    if (productProfit != null) { totalProfit += productProfit; totalCogs += cogsTotal; }
    totalNetAfterAmazon += netAfterAmazon;
    totalUnitsKept += unitsKept;

    const li = cogsInfo?.sku != null ? landed[cogsInfo.sku] : null;
    products.push({
      product: (cogsInfo?.label) || (p._id || 'Unknown').slice(0, 60),
      sku: cogsInfo?.sku || null,
      paidOrders: p.orders,
      refundOrders: ref.orders,
      unitsKept,
      netAfterAmazon: round(netAfterAmazon),
      cogsPerUnit,
      cogsBreakdown: li ? { purchase: li.purchasePerUnit, shipping: li.shippingPerUnit, manualOverride: li.manualOverride } : null,
      cogsTotal: cogsTotal != null ? round(cogsTotal) : null,
      profit: productProfit != null ? round(productProfit) : null,
      hasCost: cogsPerUnit != null,
    });
  }

  products.sort((a, b) => (b.profit ?? -Infinity) - (a.profit ?? -Infinity));

  // Account-level costs not tied to a single product (storage/subscription/etc.).
  const svc = await Transaction.aggregate([
    { $match: { ...base, type: 'Service Fees' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const serviceFees = svc[0]?.total || 0;

  // Overhead (rent/packaging) allocated across units sold in the range.
  const overheadTotal = await overheadInRange(req.query.from, req.query.to);
  const overheadPerUnit = totalUnitsKept > 0 ? overheadTotal / totalUnitsKept : 0;

  res.json({
    currency: 'USD',
    products,
    productProfit: round(totalProfit), // sum of per-product profit (after landed COGS)
    totalCogs: round(totalCogs),
    serviceFees: round(serviceFees), // negative
    overhead: round(-overheadTotal), // shown as a negative line
    overheadPerUnit: round(overheadPerUnit),
    unitsSold: totalUnitsKept,
    netProfit: round(totalProfit + serviceFees - overheadTotal), // bottom line incl. overhead
    netAfterAmazon: round(totalNetAfterAmazon),
    unmappedProducts: unmapped, // products still missing a COGS value
  });
}

// POST /api/admin/finance/import — upload a CSV (type=transactions|sales)
export async function importUpload(req, res) {
  const kind = req.query.type || req.body?.type;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded (field "file")' });
  const text = file.buffer.toString('utf8');

  if (kind === 'transactions') return res.json(await importTransactions(text));
  if (kind === 'sales') return res.json(await importDailySales(text));
  return res.status(400).json({ error: 'Query ?type must be "transactions" or "sales"' });
}

function round(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
