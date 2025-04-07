import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { generateToken } from "../helpers/jwt-helper";
import {
    badRequestResponse,
    errorResponse,
    HTTP_STATUS,
    notFoundResponse,
    sendResponse,
    serverErrorResponse,
    successResponse
} from '../helpers/response-helper';
import { UserModel } from '../models/user.model';
import { AuthenticatedRequest } from '../types';

dotenv.config();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: User ID
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *         password:
 *           type: string
 *           format: password
 *           description: User password (hashed)
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User role
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the application
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *                 example: "********"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for authentication
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Email and password are required
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendResponse(res, badRequestResponse('Email and password are required'));
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return sendResponse(res, errorResponse('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return sendResponse(res, errorResponse('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const token = generateToken(user);

        sendResponse(res, successResponse('Login successful', { token, user }));
    } catch (error) {
        console.error('Login error:', error);
        sendResponse(res, serverErrorResponse('Failed to login'));
    }
};

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Current user password
 *                 example: "********"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password to set
 *                 example: "********"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Current password and new password are required
 *       401:
 *         description: Current password is incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Current password is incorrect
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to change password
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return sendResponse(res, badRequestResponse('Current password and new password are required'));
        }

        const user = await UserModel.findById(req.user?.id);

        if (!user) {
            return sendResponse(res, notFoundResponse('User not found'));
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return sendResponse(res, errorResponse('Current password is incorrect', HTTP_STATUS.UNAUTHORIZED));
        }

        user.password = newPassword;
        await user.save();

        sendResponse(res, successResponse('Password updated successfully'));
    } catch (error) {
        console.error('Change password error:', error);
        sendResponse(res, serverErrorResponse('Failed to change password'));
    }
}; 