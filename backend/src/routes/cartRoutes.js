import express from 'express';
import {
    getCartItems,
    addOrUpdateCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart
} from '../controllers/cartController.js'; 


const router = express.Router();

// Rutas para la gestión del carrito
router.get('/:pedidoId', getCartItems);
router.post('/', addOrUpdateCartItem); 
router.put('/:id_detalle_pedido', updateCartItemQuantity);
router.delete('/:id_detalle_pedido', removeCartItem);
router.delete('/clear/:pedidoId', clearCart);

export default router;