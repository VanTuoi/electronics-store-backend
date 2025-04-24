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
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for authentication
 * 
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "5f8d04b3ab35de3d342acd4f"
 *           description: Auto-generated unique identifier
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *           description: User's email address (unique)
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *           example: "user"
 *           description: User role determining access level
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 *           description: Timestamp when user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 *           description: Timestamp when user was last updated
 * 
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@example.com"
 *           description: Registered email address
 *         password:
 *           type: string
 *           format: password
 *           example: "password123"
 *           description: Account password
 * 
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           description: JWT token for authenticated requests
 *         user:
 *           $ref: '#/components/schemas/User'
 * 
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           example: "oldPassword123"
 *           description: Current account password
 *         newPassword:
 *           type: string
 *           format: password
 *           example: "newPassword456"
 *           minLength: 6
 *           description: New password (min 6 characters)
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 400
 *         message:
 *           type: string
 *           example: "Invalid request parameters"
 * 
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate user
 *     description: Verify user credentials and return JWT token
 *     operationId: login
 *     requestBody:
 *       description: User credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successful authentication
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendResponse(res, badRequestResponse('Email and password are required'));
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return sendResponse(res, errorResponse('Sai tên đăng nhập hoặc mật khẩu', HTTP_STATUS.UNAUTHORIZED));
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return sendResponse(res, errorResponse('Sai tên đăng nhập hoặc mật khẩu', HTTP_STATUS.UNAUTHORIZED));
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const token = generateToken(user);

        sendResponse(res, successResponse('Đăng nhập thành công', { token, user }));
    } catch (error) {
        console.error('Login error:', error);
        sendResponse(res, serverErrorResponse('Đăng nhập thất bại'));
    }
};

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Change user password
 *     description: Change password after verifying current password
 *     operationId: changePassword
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Current and new password
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized (invalid current password or token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Current password is incorrect"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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