// backend/src/controllers/repairOrderController.js
import pool from '../config/db.js';

const baseQuery = `
    SELECT
        pr.id_pedido_reparacion, pr.nombre_cliente, pr.email_cliente,
        pr.telefono_cliente, pr.descripcion, pr.fecha_solicitud,
        pr.estado_reparacion, pr.id_usuario_cliente, uc.name AS nombre_usuario_cliente,
        pr.id_usuario_tecnico, ut.name AS nombre_usuario_tecnico,
        pr.id_categoria_reparacion, cr.nombre_categoria AS nombre_categoria_reparacion
    FROM
        pedido_reparacion AS pr
    LEFT JOIN users AS uc ON pr.id_usuario_cliente = uc.id
    LEFT JOIN users AS ut ON pr.id_usuario_tecnico = ut.id
    JOIN categoria_reparacion AS cr ON pr.id_categoria_reparacion = cr.id_categoria_reparacion
`;

// --- OBTENER TODOS LOS PEDIDOS DE REPARACIÓN ---
export const getAllRepairOrders = async (req, res) => {
    try {
        const [rows] = await pool.query(baseQuery);
        res.json({ pedidosReparacion: rows });
    } catch (error) {
        console.error('Error al obtener pedidos de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- OBTENER UN PEDIDO DE REPARACIÓN POR ID ---
export const getRepairOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`${baseQuery} WHERE pr.id_pedido_reparacion = ?`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pedido de reparación no encontrado.' });
        }
        res.json({ pedidoReparacion: rows[0] });
    } catch (error) {
        console.error('Error al obtener pedido de reparación por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- CREAR UN NUEVO PEDIDO DE REPARACIÓN ---
export const createRepairOrder = async (req, res) => {
    try {
        const { nombre_cliente, email_cliente, telefono_cliente, descripcion, estado_reparacion, id_usuario_cliente, id_usuario_tecnico, id_categoria_reparacion } = req.body;

        if (!nombre_cliente || !email_cliente || !telefono_cliente || !descripcion || !id_categoria_reparacion) {
            return res.status(400).json({ message: 'Faltan campos obligatorios.' });
        }
        
        const [result] = await pool.query(
            'INSERT INTO pedido_reparacion (nombre_cliente, email_cliente, telefono_cliente, descripcion, fecha_solicitud, estado_reparacion, id_usuario_cliente, id_usuario_tecnico, id_categoria_reparacion) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)',
            [nombre_cliente, email_cliente, telefono_cliente, descripcion, estado_reparacion || 'pendiente', id_usuario_cliente || null, id_usuario_tecnico || null, id_categoria_reparacion]
        );
        res.status(201).json({ message: 'Pedido de reparación creado exitosamente.', id_pedido_reparacion: result.insertId });
    } catch (error) {
        console.error('Error al crear pedido de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- ACTUALIZAR UN PEDIDO DE REPARACIÓN ---
export const updateRepairOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_cliente, email_cliente, telefono_cliente, descripcion, estado_reparacion, id_usuario_cliente, id_usuario_tecnico, id_categoria_reparacion } = req.body;

        if (!nombre_cliente || !email_cliente || !telefono_cliente || !descripcion || !estado_reparacion || !id_categoria_reparacion) {
            return res.status(400).json({ message: 'Faltan campos obligatorios.' });
        }

        const [result] = await pool.query(
            'UPDATE pedido_reparacion SET nombre_cliente = ?, email_cliente = ?, telefono_cliente = ?, descripcion = ?, estado_reparacion = ?, id_usuario_cliente = ?, id_usuario_tecnico = ?, id_categoria_reparacion = ? WHERE id_pedido_reparacion = ?',
            [nombre_cliente, email_cliente, telefono_cliente, descripcion, estado_reparacion, id_usuario_cliente || null, id_usuario_tecnico || null, id_categoria_reparacion, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido de reparación no encontrado.' });
        }
        res.json({ message: 'Pedido de reparación actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar pedido de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- ELIMINAR UN PEDIDO DE REPARACIÓN ---
export const deleteRepairOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM pedido_reparacion WHERE id_pedido_reparacion = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido de reparación no encontrado.' });
        }
        res.json({ message: 'Pedido de reparación eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar pedido de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};