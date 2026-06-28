// Maps Amazon transaction "Product Details" (which are truncated ~40 chars)
// to a catalog SKU and the per-unit cost of goods (COGS, USD).
//
// `match` is a case-insensitive prefix tested against the transaction's
// productDetails string. Order matters — first match wins, so put more
// specific prefixes before broader ones (e.g. "Idli P" before "Idli M").
//
// To add costs for newly-sold products: add an entry here (and set the same
// cost on the catalog product). Re-run scripts/applyCogs.js to sync.
export const COGS_MAP = [
  { match: 'Chanaksha Trading Stainless Steel Idli P', sku: 'CP0092', cost: 11.11, label: 'Idli Maker (variant)' },
  { match: 'Chanaksha Trading Stainless Steel Idli M', sku: 'CP0092', cost: 11.11, label: 'Idli Maker' },
  { match: 'Chanaksha Trading Spice Container', sku: 'CP0222', cost: 11.50, label: 'Spice Container' },
  { match: 'Chanaksha Trading Appam Patra Paniyaram', sku: 'CP0094', cost: 10.0, label: 'Appam Paniyaram Pan' },
  { match: 'Dosa pan 300 MM', sku: null, cost: 8.0, label: 'Dosa Pan 300 MM' },
];

// Resolve a transaction productDetails string -> { sku, cost, label } or null.
export function resolveCogs(productDetails = '') {
  const hay = productDetails.toLowerCase();
  for (const m of COGS_MAP) {
    if (hay.startsWith(m.match.toLowerCase())) return m;
  }
  return null;
}
