import { Request, Response } from 'express';
import mongoose, { FilterQuery, isValidObjectId } from 'mongoose';
import {
    badRequestResponse,
    createdResponse,
    notFoundResponse,
    sendResponse,
    serverErrorResponse,
    successResponse
} from '../helpers/response-helper';
import { Order, OrderModel } from '../models/order.model';
import { ProductModel } from '../models/product.model';
import { Product } from "../types/product";

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - address
 *         - products
 *       properties:
 *         id:
 *           type: string
 *           description: Order ID
 *         name:
 *           type: string
 *           description: Customer name
 *         phone:
 *           type: string
 *           description: Customer phone number
 *         address:
 *           type: string
 *           description: Delivery address
 *         email:
 *           type: string
 *           description: Customer email
 *         note:
 *           type: string
 *           description: Customer note
 *         status:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *           default: pending
 *           description: Order status
 *         adminNote:
 *           type: string
 *           description: Admin note
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                   example: Order created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, phone, address, email, note, shippingFee, adminNote, products } = req.body;

        console.log('shippingFee',shippingFee);

        if (!products || !Array.isArray(products) || products.length === 0) {
            console.error('Invalid or empty products array');
            return sendResponse(res, badRequestResponse('Danh sách sản phẩm không hợp lệ'));
        }

        const productIds = products.map((item: Product) => new mongoose.Types.ObjectId(item.id));
        const foundProducts = await ProductModel.find({ _id: { $in: productIds } });

        const stockIssues = products.map(item => {
            const foundProduct = foundProducts.find(p => p.id === item.id);
            
            if (!foundProduct) {
                return { 
                    productId: item.id,
                    issue: 'not_found',
                    message: `Sản phẩm không tồn tại (ID: ${item.id})`
                };
            }

            if ((foundProduct.quantity === undefined) || 
                (foundProduct.quantity <= 0) || 
                (foundProduct.quantity < item.quantity)) {
                return {
                    productId: item.id,
                    name: foundProduct.name,
                    issue: 'insufficient_stock',
                    requested: item.quantity,
                    available: foundProduct.quantity,
                    message: `Không đủ tồn kho cho sản phẩm ${foundProduct.name} (Yêu cầu: ${item.quantity}, Tồn kho: ${foundProduct.quantity})`
                };
            }

            return null;
        }).filter(Boolean);

        if (stockIssues.length > 0) {
            console.error('Stock issues detected:', stockIssues);
            return sendResponse(res, {
                statusCode: 400,
                success: false,
                message: 'Vấn đề về tồn kho sản phẩm',
                data: stockIssues,
            });
        }

        const orderProducts = products.map((item: Product) => {
            const foundProduct = foundProducts.find(p => p.id === item.id)!;
            const priceOriginal = foundProduct.price;
            const priceDiscount = foundProduct.discountPrice || 
                               (foundProduct.discountPercent ? 
                                (priceOriginal || 0) * (1 - foundProduct.discountPercent / 100) : 
                                priceOriginal);

            return {
                id: item.id,
                name: foundProduct.name,
                price: priceDiscount,
                originalPrice: priceOriginal,
                quantity: item.quantity
            };
        });

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            await Promise.all(products.map(item => 
                ProductModel.updateOne(
                    { _id: item.id },
                    { $inc: { quantity: -item.quantity } },
                    { session }
                )
            ));

            const order = await OrderModel.create([{
                name,
                phone,
                address,
                email,
                note,
                adminNote: adminNote || '',
                products: orderProducts,
                status: 'pending',
                shippingFee,
            }], { session });

            await session.commitTransaction();
            session.endSession();

            return sendResponse(res, createdResponse('Đặt hàng thành công!', order[0]));

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }

    } catch (error) {
        console.error('Create order error:', error);
        return sendResponse(res, serverErrorResponse('Đặt hàng thất bại'));
    }
};
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: List of orders
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
 *                   example: Orders retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
    const statusOptions = ["pending", "confirmed", "completed", "cancelled"];

    try {
        const { 
            status, 
            orderId, 
            search,
            /* page = '1',
            limit = '10' */
        } = req.query as {
            status?: string;
            orderId?: string;
            search?: string;
            /* page?: string;
            limit?: string; */
        };

        const filter: FilterQuery<Order> = {};
        
        if (status && statusOptions.includes(status)) {
            filter.status = status;
        }
        
        if (orderId) {
            filter._id = orderId;
        }
        
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { name: searchRegex },
                { phone: searchRegex },
                { email: searchRegex },
                { 'products.name': searchRegex }
            ] as FilterQuery<Order>['$or'];
        }

        /*
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber; */

        const [orders] = await Promise.all([
            OrderModel.find(filter)
                .sort({ createdAt: -1 })
                /* .skip(skip) 
                .limit(limitNumber) */,
            OrderModel.countDocuments(filter)
        ]);

        // sendResponse(res, successResponse('Orders retrieved successfully', {
        //     orders,
        //     total,
        //     page: pageNumber,
        //     totalPages: Math.ceil(total / limitNumber)
        // }));

        sendResponse(res, successResponse('Orders retrieved successfully', orders));
    } catch (error) {
        console.error('Get orders error:', error);
        if (error instanceof Error) {
            sendResponse(res, serverErrorResponse(error.message));
        } else {
            sendResponse(res, serverErrorResponse('Failed to fetch orders'));
        }
    }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order ID
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export const getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return sendResponse(res, badRequestResponse('Invalid order ID format'));
        }

        const order = await OrderModel.findById(id);

        if (!order) {
            return sendResponse(res, notFoundResponse('Order not found'));
        }

        sendResponse(res, successResponse('Order retrieved successfully', order));
    } catch (error) {
        console.error('Get order error:', error);
        sendResponse(res, serverErrorResponse('Failed to fetch order'));
    }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return sendResponse(res, badRequestResponse('Invalid order ID format'));
        }

        const order = await OrderModel.findByIdAndUpdate(
            id,
            { 
                status: req.body.status,
                adminNote: req.body.adminNote 
            },
            { new: true }
        );

        if (!order) {
            return sendResponse(res, notFoundResponse('Order not found'));
        }

        sendResponse(res, successResponse('Order updated successfully', order));
    } catch (error) {
        console.error('Update order error:', error);
        sendResponse(res, serverErrorResponse('Failed to update order'));
    }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted
 *       400:
 *         description: Invalid order ID
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return sendResponse(res, badRequestResponse('Invalid order ID format'));
        }

        const order = await OrderModel.findByIdAndDelete(id);

        if (!order) {
            return sendResponse(res, notFoundResponse('Order not found'));
        }

        sendResponse(res, successResponse('Order deleted successfully'));
    } catch (error) {
        console.error('Delete order error:', error);
        sendResponse(res, serverErrorResponse('Failed to delete order'));
    }
};