import { Router } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';
import { upload, uploadCsv } from '../middleware/upload.js';

import { login, me } from '../controllers/authController.js';
import * as products from '../controllers/productController.js';
import * as content from '../controllers/contentController.js';
import * as categories from '../controllers/categoryController.js';
import * as finance from '../controllers/financeController.js';
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

router.use('/admin', admin);

export default router;
