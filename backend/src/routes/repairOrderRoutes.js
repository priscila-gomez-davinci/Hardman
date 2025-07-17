import express from 'express';
import {
    getAllRepairOrders,
    getRepairOrderById,
    createRepairOrder,
    updateRepairOrder,
    deleteRepairOrder
} from '../controllers/repairOrderController.js';

const router = express.Router();

router.get('/', getAllRepairOrders);
router.get('/:id', getRepairOrderById);
router.post('/', createRepairOrder);
router.put('/:id', updateRepairOrder);
router.delete('/:id', deleteRepairOrder);

export default router;