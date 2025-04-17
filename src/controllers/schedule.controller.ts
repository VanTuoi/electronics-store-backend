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
import { ScheduleModel } from '../models/schedule.model';

interface ScheduleQuery {
    status?: string;
    $or?: Array<{
        [key: string]: { $regex: unknown; $options: string; }
    }>;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *       properties:
 *         id:
 *           type: string
 *           description: Schedule ID
 *         name:
 *           type: string
 *           description: Customer name
 *         phone:
 *           type: string
 *           description: Customer phone number
 *         note:
 *           type: string
 *           description: Customer note about the schedule
 *         status:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *           default: pending
 *           description: Schedule status
 *         adminNote:
 *           type: string
 *           description: Admin note about the schedule
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Create a new schedule
 *     tags: [Schedules]
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
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 description: Customer name
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 description: Customer phone number
 *                 example: "+1234567890"
 *               note:
 *                 type: string
 *                 description: Customer note
 *                 example: "I need an appointment for consultation"
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *                 example: "pending"
 *               adminNote:
 *                 type: string
 *                 description: Admin note
 *                 example: "VIP customer"
 *     responses:
 *       201:
 *         description: Schedule created successfully
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
 *                   example: Schedule created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
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
 *                   example: Failed to create schedule
 */
export const createSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const schedule = await ScheduleModel.create(req.body);
        sendResponse(res, createdResponse('Schedule created successfully', schedule));
    } catch (error) {
        console.error('Create schedule error:', error);
        sendResponse(res, serverErrorResponse('Failed to create schedule'));
    }
};

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Get all schedules
 *     tags: [Schedules]
 *     responses:
 *       200:
 *         description: List of schedules retrieved successfully
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
 *                   example: Schedules retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
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
 *                   example: Failed to fetch schedules
 */
export const getSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
        const statusOptions = ["pending", "confirmed", "completed", "cancelled"];
        const { status, search } = req.query;
        const query: ScheduleQuery = {};

        if (status) {
            if (!statusOptions.includes(status as string)) {
                return sendResponse(res, badRequestResponse('Invalid status value'));
            }
            query.status = status as string;
        }

        if (search && typeof search === 'string') {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const schedules = await ScheduleModel.find(query).sort({ createdAt: -1 });
        sendResponse(res, successResponse('Schedules retrieved successfully', schedules));
    } catch (error) {
        console.error('Get schedules error:', error);
        sendResponse(res, serverErrorResponse('Failed to fetch schedules'));
    }
};

/**
 * @swagger
 * /api/schedules/{id}:
 *   get:
 *     summary: Get a schedule by ID
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Schedule details retrieved successfully
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
 *                   example: Schedule retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Invalid schedule ID format
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
 *                   example: Invalid schedule ID format
 *       404:
 *         description: Schedule not found
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
 *                   example: Schedule not found
 */
export const getSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return sendResponse(res, badRequestResponse('Invalid schedule ID format'));
        }

        const schedule = await ScheduleModel.findById(id);

        if (!schedule) {
            return sendResponse(res, notFoundResponse('Schedule not found'));
        }

        sendResponse(res, successResponse('Schedule retrieved successfully', schedule));
    } catch (error) {
        console.error('Get schedule error:', error);
        sendResponse(res, serverErrorResponse('Failed to fetch schedule'));
    }
};

/**
 * @swagger
 * /api/schedules/{id}:
 *   put:
 *     summary: Update a schedule
 *     tags: [Schedules]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Customer name
 *                 example: "Updated Name"
 *               phone:
 *                 type: string
 *                 description: Customer phone number
 *                 example: "+9876543210"
 *               note:
 *                 type: string
 *                 description: Customer note
 *                 example: "Updated note"
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *                 example: "confirmed"
 *               adminNote:
 *                 type: string
 *                 description: Admin note
 *                 example: "Updated admin note"
 *     responses:
 *       200:
 *         description: Schedule updated successfully
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
 *                   example: Schedule updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Invalid schedule ID format
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */
export const updateSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return sendResponse(res, badRequestResponse('Invalid schedule ID format'));
        }

        const schedule = await ScheduleModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!schedule) {
            return sendResponse(res, notFoundResponse('Schedule not found'));
        }

        sendResponse(res, successResponse('Schedule updated successfully', schedule));
    } catch (error) {
        console.error('Update schedule error:', error);
        sendResponse(res, serverErrorResponse('Failed to update schedule'));
    }
};

/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     summary: Delete a schedule
 *     tags: [Schedules]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
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
 *                   example: Schedule deleted successfully
 *       400:
 *         description: Invalid schedule ID format
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */
export const deleteSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return sendResponse(res, badRequestResponse('Invalid schedule ID format'));
        }

        const schedule = await ScheduleModel.findByIdAndDelete(id);

        if (!schedule) {
            return sendResponse(res, notFoundResponse('Schedule not found'));
        }

        sendResponse(res, successResponse('Schedule deleted successfully'));
    } catch (error) {
        console.error('Delete schedule error:', error);
        sendResponse(res, serverErrorResponse('Failed to delete schedule'));
    }
};