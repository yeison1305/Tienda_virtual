import { Router } from 'express';
import { getCollections, getCollectionBySlug } from '../controllers/productController';

const router = Router();

router.get('/collections', getCollections);
router.get('/collections/:slug', getCollectionBySlug);

export default router;