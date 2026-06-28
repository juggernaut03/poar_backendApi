// Parsers for the two Amazon CSV exports used by the finance module.
import crypto from 'node:crypto';

// Minimal RFC-4180 CSV line splitter: handles "quoted, fields" and "" escapes.
export function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') {
      inQ = true;
    } else if (ch === ',') {
      out.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

// "$13,592.47" / "-9.56" / "" -> number
export function money(v) {
  if (v == null) return 0;
  const n = Number(String(v).replace(/[$,"\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

// ---- Transactions report ----
// Columns: Date, Transaction type, Order ID, Product Details,
//          Total product charges, Total promotional rebates,
//          Amazon fees, Other, Total (USD)
export function parseTransactions(text) {
  const clean = text.replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const c = splitCsvLine(lines[i]);
    if (c.length < 9) continue;
    const [dateStr, type, orderId, product, pc, promo, fees, other, total] = c;
    if (!dateStr || !type || type === 'Transaction type') continue;

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) continue;

    const row = {
      date,
      type: type.trim(),
      orderId: (orderId || '').trim(),
      productDetails: (product || '').trim(),
      productCharges: money(pc),
      promoRebates: money(promo),
      amazonFees: money(fees),
      other: money(other),
      total: money(total),
      currency: 'USD',
    };
    // Stable de-dupe key (re-import same file => no duplicates).
    row.dedupeKey = crypto
      .createHash('sha1')
      .update(`${dateStr}|${row.type}|${row.orderId}|${row.productDetails}|${row.total}`)
      .digest('hex');
    rows.push(row);
  }
  return rows;
}

// ---- Sales Dashboard report (multi-section) ----
// We only extract the daily "Compare Sales - Graph view" series:
//   Time, Selected sales, Selected units, PrevYear sales, PrevYear units
export function parseSalesDashboard(text) {
  const clean = text.replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/);
  const rows = [];

  for (const line of lines) {
    // Daily rows start with an ISO timestamp like 2026-01-01T00:00:00
    if (!/^\d{4}-\d{2}-\d{2}T/.test(line)) continue;
    const c = splitCsvLine(line);
    if (c.length < 5) continue;
    const date = new Date(c[0]);
    if (Number.isNaN(date.getTime())) continue;
    rows.push({
      date,
      sales: money(c[1]),
      units: Number(c[2]) || 0,
      salesPrevYear: money(c[3]),
      unitsPrevYear: Number(c[4]) || 0,
      currency: 'USD',
    });
  }
  return rows;
}
