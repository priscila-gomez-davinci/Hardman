import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/userController.js';

const router = express.Router();

// Rutas para gestión de usuarios.
// IDEALMENTE: Estas rutas deberían estar protegidas por middlewares
// router.get('/', authenticateToken, authorizeRole(['admin']), getAllUsers);
// router.get('/:id', authenticateToken, authorizeRole(['admin']), getUserById);
// router.post('/', authenticateToken, authorizeRole(['admin']), createUser);
// router.put('/:id', authenticateToken, authorizeRole(['admin']), updateUser);
// router.delete('/:id', authenticateToken, authorizeRole(['admin']), deleteUser);

// Por ahora, para pruebas, las dejaremos sin protección, tamos jodidos con el tiempo
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;