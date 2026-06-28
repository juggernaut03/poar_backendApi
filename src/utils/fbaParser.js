// Parse an Amazon FBA shipment manifest TSV.
//
// Format:
//   Shipment ID<TAB>FBA1949Z2RJ7
//   Name<TAB>FBA STA (...)-TMB8
//   ... more key/value header rows ...
//   <blank line>
//   Merchant SKU<TAB>Title<TAB>ASIN<TAB>...<TAB>Shipped
//   CP0092<TAB>Title<TAB>B07...<TAB>...<TAB>342
//
// Returns: { shipmentId, name, lines: [{ sku, title, asin, units }], totalUnits }
export function parseFbaShipment(text) {
  const clean = text.replace(/^﻿/, '');
  const rows = clean.split(/\r?\n/);

  const header = {};
  let i = 0;
  // Header block: key/value pairs until we hit the item table header row.
  for (; i < rows.length; i++) {
    const cells = rows[i].split('\t');
    if (cells[0] === 'Merchant SKU') break; // start of item table
    if (cells.length >= 2 && cells[0].trim()) header[cells[0].trim()] = (cells[1] || '').trim();
  }

  // The item header row is at index i; its columns tell us where "Shipped" is.
  const cols = (rows[i] || '').split('\t').map((c) => c.trim());
  const idxSku = cols.indexOf('Merchant SKU');
  const idxTitle = cols.indexOf('Title');
  const idxAsin = cols.indexOf('ASIN');
  let idxShipped = cols.indexOf('Shipped');
  if (idxShipped === -1) idxShipped = cols.length - 1; // fall back to last column

  const lines = [];
  for (let j = i + 1; j < rows.length; j++) {
    const c = rows[j].split('\t');
    if (!c[idxSku] || !c[idxSku].trim()) continue;
    const units = parseInt(c[idxShipped], 10);
    if (!Number.isFinite(units) || units <= 0) continue;
    lines.push({
      sku: c[idxSku].trim(),
      title: (c[idxTitle] || '').trim(),
      asin: (c[idxAsin] || '').trim(),
      units,
    });
  }

  return {
    shipmentId: header['Shipment ID'] || '',
    name: header['Name'] || '',
    totalUnits: lines.reduce((s, l) => s + l.units, 0),
    lines,
  };
}
