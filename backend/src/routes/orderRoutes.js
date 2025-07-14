import express from 'express';
import {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getAllOrders);
router.post('/', createOrder);
router.get('/:id', getOrderById);
router.delete('/:id', deleteOrder);
router.put('/:id/estado', updateOrderStatus); 

export default router;