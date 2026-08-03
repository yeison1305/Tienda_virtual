import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as userCtrl from '../controllers/userController';

const router = Router();

// Debug middleware
router.use((req, res, next) => {
  console.log('userRoutes - ENTRY:', req.method, req.path, 'Body:', req.body);
  next();
});

router.use(requireAuth);

// Debug after auth
router.use((req, res, next) => {
  console.log('userRoutes - AFTER AUTH:', req.method, req.path, 'Body:', req.body);
  next();
});

router.get('/profile', userCtrl.getProfile);
router.put('/profile', userCtrl.updateProfile);

router.get('/orders', userCtrl.getMyOrders);
router.get('/orders/:id', userCtrl.getOrderDetail);
router.get('/addresses', userCtrl.getAddresses);
router.post('/addresses', userCtrl.createAddress);
router.put('/addresses/:id', userCtrl.updateAddress);
router.delete('/addresses/:id', userCtrl.deleteAddress);
router.put('/addresses/:id/default', userCtrl.setDefaultAddress);

export default router;