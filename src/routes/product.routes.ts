import express from 'express';
import * as productController from '../controllers/product.controller';
import { verifyAdminRole, verifyTokenMiddleware } from '../middlewares/authentication';
import { upload } from '../middlewares/upload.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

router.post('/', verifyTokenMiddleware, verifyAdminRole, upload.array('images', 5), productController.createProduct);
router.put('/:id', verifyTokenMiddleware, verifyAdminRole, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', verifyTokenMiddleware, verifyAdminRole, productController.deleteProduct);

export default router; 