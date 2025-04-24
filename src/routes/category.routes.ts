import express from 'express';
import {
    createCategory,
    deleteCategory,
    getCategories,
    getCategory,
    updateCategory
} from '../controllers/category.controller';
import { verifyAdminRole, verifyTokenMiddleware } from '../middlewares/authentication';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', verifyTokenMiddleware, verifyAdminRole, createCategory);
router.put('/:id', verifyTokenMiddleware, verifyAdminRole, updateCategory);
router.delete('/:id', verifyTokenMiddleware, verifyAdminRole, deleteCategory);

export default router; 