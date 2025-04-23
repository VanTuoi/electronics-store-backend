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

router.get('/:id', getOrder);
router.get('/', verifyTokenMiddleware, verifyAdminRole, getOrders);
router.post('/', createOrder);
router.put('/:id', verifyTokenMiddleware, verifyAdminRole, updateOrder);
router.delete('/:id', verifyTokenMiddleware, verifyAdminRole, deleteOrder);

export default router;