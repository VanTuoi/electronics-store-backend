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
 *           example: "5f8d04b3ab35de3d342acd4f"
 *           description: Auto-generated unique identifier
 *         name:
 *           type: string
 *           example: "Electronics"
 *           description: Category name (unique)
 *         description:
 *           type: string
 *           example: "Electronic devices and accessories"
 *           description: Optional category description
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 *           description: Timestamp when category was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 *           description: Timestamp when category was last updated
 * 
 *     CategoryRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Electronics"
 *           description: Category name
 *         description:
 *           type: string
 *           example: "Electronic devices and accessories"
 *           description: Optional category description
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
 */

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Product categories management
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a new category
 *     description: Create a new product category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryRequest'
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
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
 *     tags: [Categories]
 *     summary: Get all categories
 *     description: Retrieve a list of all product categories
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
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
 *                   example: "Categories retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *     tags: [Categories]
 *     summary: Get a category by ID
 *     description: Retrieve details of a specific category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "5f8d04b3ab35de3d342acd4f"
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
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Category retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid category ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
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
 *     tags: [Categories]
 *     summary: Update a category
 *     description: Update details of an existing category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "5f8d04b3ab35de3d342acd4f"
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryRequest'
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *                   example: "Category updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
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
 *     tags: [Categories]
 *     summary: Delete a category
 *     description: Delete an existing category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "5f8d04b3ab35de3d342acd4f"
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
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *       400:
 *         description: Invalid category ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
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