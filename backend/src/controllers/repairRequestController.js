import pool from '../config/db.js';

// --- CREAR UNA NUEVA SOLICITUD DE REPARACIÓN ---
// POST /api/repair-requests
export const createRepairRequest = async (req, res) => {
    try {
        const {
            nombre_cliente, 
            email_cliente, 
            telefono_cliente, 
            descripcion,    
            id_categoria_reparacion, 
            id_usuario_cliente 
        } = req.body;

        if (!nombre_cliente || !email_cliente || !telefono_cliente || !descripcion || !id_categoria_reparacion) {
            return res.status(400).json({ message: 'Faltan campos obligatorios para la solicitud de reparación.' });
        }

        const estadoInicial = 'pendiente'; 

        const [result] = await pool.query(
            `INSERT INTO pedido_reparacion (
                nombre_cliente,
                email_cliente,
                telefono_cliente,
                descripcion,
                fecha_solicitud,
                estado_reparacion,
                id_usuario_cliente,
                id_usuario_tecnico,      -- Se inicia como NULL
                id_categoria_reparacion
            ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?);`,
            [
                nombre_cliente,
                email_cliente,
                telefono_cliente,
                descripcion,
                estadoInicial,
                id_usuario_cliente || null, 
                null,                       
                id_categoria_reparacion
            ]
        );

        res.status(201).json({
            message: 'Solicitud de reparación enviada exitosamente.',
            id_solicitud: result.insertId
        });

    } catch (error) {
        console.error('Error al crear solicitud de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud.' });
    }
};


export const getAllRepairRequests = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                pr.id_pedido_reparacion,
                pr.nombre_cliente,
                pr.email_cliente,
                pr.telefono_cliente,
                pr.descripcion,
                pr.fecha_solicitud,
                pr.estado_reparacion,
                pr.id_usuario_cliente,
                pr.id_usuario_tecnico,
                pr.id_categoria_reparacion,
                uc.nombre AS nombre_usuario_cliente,     -- Nombre del usuario que hizo la solicitud
                uc.email AS email_usuario_cliente,       -- Email del usuario que hizo la solicitud
                ut.nombre AS nombre_usuario_tecnico,     -- Nombre del técnico asignado
                ut.apellido AS apellido_usuario_tecnico, -- Apellido del técnico (si lo necesitas)
                cr.nombre_categoria AS nombre_categoria_reparacion -- Nombre de la categoría de reparación
            FROM pedido_reparacion AS pr
            LEFT JOIN usuario AS uc ON pr.id_usuario_cliente = uc.id_usuario
            LEFT JOIN usuario AS ut ON pr.id_usuario_tecnico = ut.id_usuario
            LEFT JOIN categoria_reparacion AS cr ON pr.id_categoria_reparacion = cr.id_categoria_reparacion
            ORDER BY pr.fecha_solicitud DESC;
        `);
        // Normalizar los nombres de las columnas para el front
        const normalizedRequests = rows.map(r => ({
            id: r.id_pedido_reparacion,
            clientName: r.nombre_cliente,
            clientEmail: r.email_cliente,
            clientPhone: r.telefono_cliente,
            description: r.descripcion,
            requestDate: r.fecha_solicitud,
            status: r.estado_reparacion,
            clientUserId: r.id_usuario_cliente,
            technicianUserId: r.id_usuario_tecnico,
            categoryRepairId: r.id_categoria_reparacion,
            clientUserName: r.nombre_usuario_cliente,
            clientUserEmail: r.email_usuario_cliente,
            technicianUserName: r.nombre_usuario_tecnico,
            technicianUserLastName: r.apellido_usuario_tecnico, 
            categoryName: r.nombre_categoria_reparacion
        }));
        res.json({ repairRequests: normalizedRequests });
    } catch (error) {
        console.error('Error al obtener solicitudes de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const deleteRepairRequest = async (req, res) => {
    try {
        const { id } = req.params; 
        const [result] = await pool.query('DELETE FROM pedido_reparacion WHERE id_pedido_reparacion = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Solicitud de reparación no encontrada o ya eliminada.' });
        }
        res.status(200).json({ message: 'Solicitud de reparación eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar solicitud de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar la solicitud.' });
    }
};

export const updateRepairRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_reparacion, id_usuario_tecnico } = req.body;
        if (!estado_reparacion) {
            return res.status(400).json({ message: 'El estado de la reparación es requerido.' });
        }

        let updateQuery = 'UPDATE pedido_reparacion SET estado_reparacion = ?';
        let queryParams = [estado_reparacion];

        if (id_usuario_tecnico !== undefined) {
            updateQuery += ', id_usuario_tecnico = ?';
            queryParams.push(id_usuario_tecnico || null);
        }
        updateQuery += ' WHERE id_pedido_reparacion = ?';
        queryParams.push(id);

        const [result] = await pool.query(updateQuery, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Solicitud de reparación no encontrada.' });
        }
        res.json({ message: 'Estado de la reparación actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar estado de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

