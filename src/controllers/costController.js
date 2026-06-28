import { PurchaseBatch } from '../models/PurchaseBatch.js';
import { Shipment } from '../models/Shipment.js';
import { Overhead } from '../models/Overhead.js';
import { computeLandedCogs } from '../utils/landedCogs.js';

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
