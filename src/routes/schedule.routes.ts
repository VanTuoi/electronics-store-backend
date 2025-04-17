import express from 'express';
import {
    createSchedule,
    deleteSchedule,
    getSchedule,
    getSchedules,
    updateSchedule
} from '../controllers/schedule.controller';
import { verifyAdminRole, verifyTokenMiddleware } from '../middlewares/authentication';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Schedule management
 */

router.get('/', verifyTokenMiddleware, verifyAdminRole, getSchedules);
router.get('/:id',verifyTokenMiddleware, verifyAdminRole, getSchedule);
router.post('/', createSchedule);
router.put('/:id', verifyTokenMiddleware, verifyAdminRole, updateSchedule);
router.delete('/:id', verifyTokenMiddleware, verifyAdminRole, deleteSchedule);

export default router;