import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import {
    badRequestResponse,
    createdResponse,
    notFoundResponse,
    sendResponse,
    serverErrorResponse,
    successResponse
} from '../helpers/response-helper';
import { CategoryModel } from '../models/category.model';

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Category ID
 *         name:
 *           type: string
 *           description: Category name
 *         description:
 *           type: string
 *           description: Category description
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *                 example: "Electronics"
 *               description:
 *                 type: string
 *                 description: Category description
 *                 example: "Electronic devices and accessories"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Category created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input data
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
 *                   example: Failed to create category
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = await CategoryModel.create(req.body);
        sendResponse(res, createdResponse('Category created successfully', category));
    } catch (error) {
        console.error('Create category error:', error);
        sendResponse(res, serverErrorResponse('Failed to create category'));
    }
};

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
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
 *                   example: Categories retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
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
 *                   example: Failed to fetch categories
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await CategoryModel.find().sort({ name: 1 });
        sendResponse(res, successResponse('Categories retrieved successfully', categories));
    } catch (error) {
        console.error('Get categories error:', error);
        sendResponse(res, serverErrorResponse('Failed to fetch categories'));
    }
};

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details retrieved successfully
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
 *                   example: Category retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid category ID format
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
 *                   example: Invalid category ID format
 *       404:
 *         description: Category not found
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
 *                   example: Category not found
 */
export const getCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return sendResponse(res, badRequestResponse('Invalid category ID format'));
        }

        const category = await CategoryModel.findById(id);

        if (!category) {
            return sendResponse(res, notFoundResponse('Category not found'));
        }

        sendResponse(res, successResponse('Category retrieved successfully', category));
    } catch (error) {
        console.error('Get category error:', error);
        sendResponse(res, serverErrorResponse('Failed to fetch category'));
    }
};

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *                 example: "Updated Electronics"
 *               description:
 *                 type: string
 *                 description: Category description
 *                 example: "Updated description for electronic devices"
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *                   example: Category updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid category ID format
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return sendResponse(res, badRequestResponse('Invalid category ID format'));
        }

        const category = await CategoryModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!category) {
            return sendResponse(res, notFoundResponse('Category not found'));
        }

        sendResponse(res, successResponse('Category updated successfully', category));
    } catch (error) {
        console.error('Update category error:', error);
        sendResponse(res, serverErrorResponse('Failed to update category'));
    }
};

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
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
 *                   example: Category deleted successfully
 *       400:
 *         description: Invalid category ID format
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return sendResponse(res, badRequestResponse('Invalid category ID format'));
        }

        const category = await CategoryModel.findByIdAndDelete(id);

        if (!category) {
            return sendResponse(res, notFoundResponse('Category not found'));
        }

        sendResponse(res, successResponse('Category deleted successfully'));
    } catch (error) {
        console.error('Delete category error:', error);
        sendResponse(res, serverErrorResponse('Failed to delete category'));
    }
}; 