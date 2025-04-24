import express from 'express';
import { createProduct, deleteProduct, getProduct, getProducts, getProductsForAdmin, getRandomProducts, updateProduct } from '../controllers/product.controller';
import { verifyAdminRole, verifyTokenMiddleware } from '../middlewares/authentication';
import { upload } from '../middlewares/upload.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

router.get('/admin', verifyTokenMiddleware, verifyAdminRole, getProductsForAdmin);
router.get('/random', getRandomProducts);
router.get('/:id', getProduct);
router.get('/', getProducts);
router.post('/', verifyTokenMiddleware, verifyAdminRole, upload.array('files[]', 10), createProduct);
router.put('/:id', verifyTokenMiddleware, verifyAdminRole, upload.array('files[]', 10), updateProduct);
router.delete('/:id', verifyTokenMiddleware, verifyAdminRole, deleteProduct);

export default router; 