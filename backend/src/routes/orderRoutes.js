import express from 'express';
import {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    getUserActiveCartOrCreate 
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getAllOrders); 
router.post('/', createOrder); 
router.get('/:id', getOrderById); 
router.delete('/:id', deleteOrder); 
router.put('/:id/estado', updateOrderStatus); 

router.get('/my-cart/:userId', getUserActiveCartOrCreate); 

export default router;