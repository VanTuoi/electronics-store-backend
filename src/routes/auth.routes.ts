import express from 'express';
import { changePassword, login } from '../controllers/auth.controller';
import { verifyTokenMiddleware } from '../middlewares/authentication';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication management
 */

router.post('/login', login);
router.post('/change-password', verifyTokenMiddleware, changePassword);

export default router; 