import { PurchaseBatch } from '../models/PurchaseBatch.js';
import { Shipment } from '../models/Shipment.js';
import { Overhead } from '../models/Overhead.js';
import { computeLandedCogs } from '../utils/landedCogs.js';
import { parseFbaShipment } from '../utils/fbaParser.js';

// ---- Purchase batches ----
export async function listBatches(req, res) {
  res.json(await PurchaseBatch.find().sort({ date: -1 }));
}
export async function createBatch(req, res) {
  res.status(201).json(await PurchaseBatch.create(req.body));
}
export async function updateBatch(req, res) {
  const b = await PurchaseBatch.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!b) return res.status(404).json({ error: 'Not found' });
  res.json(b);
}
export async function deleteBatch(req, res) {
  await PurchaseBatch.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}

// ---- Shipments ----
export async function listShipments(req, res) {
  res.json(await Shipment.find().sort({ date: -1 }));
}
export async function createShipment(req, res) {
  res.status(201).json(await Shipment.create(req.body));
}
export async function updateShipment(req, res) {
  const s = await Shipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(s);
}
export async function deleteShipment(req, res) {
  await Shipment.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}

// POST /api/admin/costs/shipments/import-fba — upload an FBA manifest TSV.
// Upserts by shipmentId so re-uploading updates rather than duplicates.
// Shipping cost is preserved if already set; pass ?cost=NN to set it.
export async function importFbaShipment(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded (field "file")' });
  const parsed = parseFbaShipment(req.file.buffer.toString('utf8'));
  if (!parsed.shipmentId || !parsed.lines.length) {
    return res.status(400).json({ error: 'Could not parse an FBA shipment from this file' });
  }
  const cost = req.query.cost != null ? Number(req.query.cost) : null;

  const existing = await Shipment.findOne({ shipmentId: parsed.shipmentId });
  const doc = existing || new Shipment({ shipmentId: parsed.shipmentId });
  doc.name = parsed.name;
  doc.lines = parsed.lines.map((l) => ({ sku: l.sku, units: l.units }));
  if (cost != null && Number.isFinite(cost)) doc.totalShippingCost = cost;
  await doc.save();

  res.status(existing ? 200 : 201).json({
    shipment: doc,
    parsed: { shipmentId: parsed.shipmentId, name: parsed.name, totalUnits: parsed.totalUnits, lineCount: parsed.lines.length },
    updated: Boolean(existing),
  });
}

// ---- Overheads ----
export async function listOverheads(req, res) {
  res.json(await Overhead.find().sort({ date: -1 }));
}
export async function createOverhead(req, res) {
  res.status(201).json(await Overhead.create(req.body));
}
export async function updateOverhead(req, res) {
  const o = await Overhead.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!o) return res.status(404).json({ error: 'Not found' });
  res.json(o);
}
export async function deleteOverhead(req, res) {
  await Overhead.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}

// ---- Computed landed COGS (per SKU) ----
export async function landedCogs(req, res) {
  res.json(await computeLandedCogs());
}
