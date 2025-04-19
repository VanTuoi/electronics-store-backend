import express from 'express';
import {
    createOrder,
    deleteOrder,
    getOrder,
    getOrders,
    updateOrder
} from '../controllers/order.controller';
import { verifyAdminRole, verifyTokenMiddleware } from '../middlewares/authentication';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

router.post('/', createOrder);

router.get('/', verifyTokenMiddleware, verifyAdminRole, getOrders);
router.get('/:id', verifyTokenMiddleware, verifyAdminRole, getOrder);
router.put('/:id', verifyTokenMiddleware, verifyAdminRole, updateOrder);
router.delete('/:id', verifyTokenMiddleware, verifyAdminRole, deleteOrder);

export default router;