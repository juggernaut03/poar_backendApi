import { Router } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';
import { upload, uploadCsv } from '../middleware/upload.js';

import { login, me } from '../controllers/authController.js';
import * as products from '../controllers/productController.js';
import * as content from '../controllers/contentController.js';
import * as categories from '../controllers/categoryController.js';
import * as finance from '../controllers/financeController.js';
import * as costs from '../controllers/costController.js';
import { uploadFiles } from '../controllers/uploadController.js';

const router = Router();

// ---------- Public API (storefront) ----------
router.get('/products', asyncHandler(products.listPublic));
router.get('/products/:slug', asyncHandler(products.getBySlug));
router.get('/categories', asyncHandler(products.listCategories));
router.get('/categories/managed', asyncHandler(categories.listPublic));
router.get('/content', asyncHandler(content.listPublic));
router.get('/content/:key', asyncHandler(content.getPublic));

// ---------- Auth ----------
router.post('/auth/login', asyncHandler(login));
router.get('/auth/me', requireAuth, asyncHandler(me));

// ---------- Admin API (protected) ----------
const admin = Router();
admin.use(requireAuth);

// Products
admin.get('/products', asyncHandler(products.adminList));
admin.post('/products', asyncHandler(products.adminCreate));
admin.get('/products/:id', asyncHandler(products.adminGet));
admin.put('/products/:id', asyncHandler(products.adminUpdate));
admin.delete('/products/:id', asyncHandler(products.adminDelete));

// CMS content
admin.get('/content', asyncHandler(content.adminList));
admin.put('/content/:key', asyncHandler(content.adminUpsert));
admin.delete('/content/:key', asyncHandler(content.adminDelete));

// Categories
admin.get('/categories', asyncHandler(categories.adminList));
admin.post('/categories', asyncHandler(categories.adminCreate));
admin.put('/categories/:id', asyncHandler(categories.adminUpdate));
admin.delete('/categories/:id', asyncHandler(categories.adminDelete));

// Uploads
admin.post('/uploads', upload.array('files', 8), asyncHandler(uploadFiles));

// Finance / P&L
admin.get('/finance/summary', asyncHandler(finance.summary));
admin.get('/finance/sales-trend', asyncHandler(finance.salesTrend));
admin.get('/finance/top-products', asyncHandler(finance.topProducts));
admin.get('/finance/profit', asyncHandler(finance.profit));
admin.get('/finance/transactions', asyncHandler(finance.listTransactions));
admin.post('/finance/import', uploadCsv.single('file'), asyncHandler(finance.importUpload));

// Costs: purchase batches, shipments, overheads, computed landed COGS
admin.get('/costs/landed', asyncHandler(costs.landedCogs));
admin.get('/costs/batches', asyncHandler(costs.listBatches));
admin.post('/costs/batches', asyncHandler(costs.createBatch));
admin.put('/costs/batches/:id', asyncHandler(costs.updateBatch));
admin.delete('/costs/batches/:id', asyncHandler(costs.deleteBatch));
admin.get('/costs/shipments', asyncHandler(costs.listShipments));
admin.post('/costs/shipments', asyncHandler(costs.createShipment));
admin.put('/costs/shipments/:id', asyncHandler(costs.updateShipment));
admin.delete('/costs/shipments/:id', asyncHandler(costs.deleteShipment));
admin.get('/costs/overheads', asyncHandler(costs.listOverheads));
admin.post('/costs/overheads', asyncHandler(costs.createOverhead));
admin.put('/costs/overheads/:id', asyncHandler(costs.updateOverhead));
admin.delete('/costs/overheads/:id', asyncHandler(costs.deleteOverhead));

router.use('/admin', admin);

export default router;
