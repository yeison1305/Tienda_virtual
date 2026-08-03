import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin';
import * as admin from '../controllers/adminController';

const router = Router();

// Debug middleware
router.use((req, res, next) => {
  console.log('Admin route hit:', req.method, req.path, 'Body:', req.body);
  next();
});

// All routes require admin
router.use(requireAdmin);

router.get('/stats', admin.getStats);
router.get('/products', admin.getAllProducts);
router.post('/products', admin.createProduct);
router.put('/products/:id', admin.updateProduct);
router.delete('/products/:id', admin.deleteProduct);
router.delete('/products/:id/hard', admin.hardDeleteProduct);
router.get('/orders', admin.getAllOrders);
router.put('/orders/:id/status', admin.updateOrderStatus);
router.get('/categories', admin.getAllCategories);
router.post('/categories', admin.createCategory);
router.put('/categories/:id', admin.updateCategory);
router.delete('/categories/:id', admin.deleteCategory);

// Collections
router.get('/collections', admin.getAllCollections);
router.post('/collections', admin.createCollection);
router.put('/collections/:id', admin.updateCollection);
router.delete('/collections/:id', admin.deleteCollection);

// Newsletter
router.get('/newsletter/subscribers', admin.getNewsletterSubscribers);
router.post('/newsletter/send', admin.sendNewsletter);

export default router;
