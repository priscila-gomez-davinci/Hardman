// src/routes/productRoutes.js
import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

// Ruta para obtener todos los productos (SIN el /api)
router.get('/', getAllProducts); // Cambiado de '/api/products' a '/'

// Ruta para obtener un solo producto por su ID
router.get('/:id', getProductById); // Cambiado de '/api/products/:id' a '/:id'

// Ruta para crear un nuevo producto
router.post('/', createProduct); // Cambiado de '/api/products' a '/'

// Ruta para actualizar un producto existente
router.put('/:id', updateProduct); // Cambiado de '/api/products/:id' a '/:id'

// Ruta para eliminar un producto
router.delete('/:id', deleteProduct); // Cambiado de '/api/products/:id' a '/:id'

export default router;