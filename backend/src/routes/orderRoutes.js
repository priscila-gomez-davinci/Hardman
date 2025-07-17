import express from 'express';
import {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    getUserActiveCartOrCreate // <-- ¡IMPORTA ESTA FUNCIÓN!
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getAllOrders); // Ruta para obtener todas las ÓRDENES finalizadas
router.post('/', createOrder); // Ruta para CREAR una ORDEN finalizada
router.get('/:id', getOrderById); // Ruta para obtener una ORDEN finalizada por ID
router.delete('/:id', deleteOrder); // Ruta para ELIMINAR una ORDEN finalizada
router.put('/:id/estado', updateOrderStatus); // Ruta para actualizar el ESTADO de una ORDEN finalizada

// --- ¡AGREGA ESTA LÍNEA PARA LA RUTA DEL CARRITO! ---
router.get('/my-cart/:userId', getUserActiveCartOrCreate); // <-- Ruta para obtener/crear el carrito activo del usuario

export default router;