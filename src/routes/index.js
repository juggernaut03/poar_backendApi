import { Router } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

import { login, me } from '../controllers/authController.js';
import * as products from '../controllers/productController.js';
import * as content from '../controllers/contentController.js';
import { uploadFiles } from '../controllers/uploadController.js';

const router = Router();

// ---------- Public API (storefront) ----------
router.get('/products', asyncHandler(products.listPublic));
router.get('/products/:slug', asyncHandler(products.getBySlug));
router.get('/categories', asyncHandler(products.listCategories));
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

// Uploads
admin.post('/uploads', upload.array('files', 8), asyncHandler(uploadFiles));

router.use('/admin', admin);

export default router;
