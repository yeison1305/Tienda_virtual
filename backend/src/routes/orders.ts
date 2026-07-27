import { Router, Request, Response } from 'express';
import { createOrder, getUserOrders } from '../controllers/orderController';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', requireAuth, getUserOrders);

export default router;
