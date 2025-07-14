import pool from '../config/db.js';

// --- OBTENER TODOS LOS PEDIDOS CON SUS DETALLES ---
export const getAllOrders = async (req, res) => {
    try {
        const [pedidos] = await pool.query(`
            SELECT p.*, u.name AS nombre_usuario, u.email AS email_usuario, mp.nombre_metodo_pago
            FROM pedido AS p
            JOIN users AS u ON p.id_usuario = u.id
            JOIN metodo_pago AS mp ON p.id_metodo_pago = mp.id_metodo_pago
        `);

        // Para cada pedido, obtenemos sus detalles
        for (let pedido of pedidos) {
            const [detalles] = await pool.query(`
                SELECT dp.*, prod.nombre_producto, prod.sku
                FROM detalle_pedido AS dp
                JOIN producto AS prod ON dp.id_producto = prod.id_producto
                WHERE dp.id_pedido = ?
            `, [pedido.id_pedido]);
            pedido.detalles = detalles;
        }

        res.json({ pedidos });
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- OBTENER UN PEDIDO POR ID CON SUS DETALLES ---
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const [pedidos] = await pool.query(`
            SELECT p.*, u.name AS nombre_usuario, u.email AS email_usuario, mp.nombre_metodo_pago
            FROM pedido AS p
            JOIN users AS u ON p.id_usuario = u.id
            JOIN metodo_pago AS mp ON p.id_metodo_pago = mp.id_metodo_pago
            WHERE p.id_pedido = ?
        `, [id]);

        if (pedidos.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }
        const pedido = pedidos[0];

        const [detalles] = await pool.query(`
            SELECT dp.*, prod.nombre_producto, prod.sku
            FROM detalle_pedido AS dp
            JOIN producto AS prod ON dp.id_producto = prod.id_producto
            WHERE dp.id_pedido = ?
        `, [pedido.id_pedido]);
        pedido.detalles = detalles;

        res.json({ pedido });
    } catch (error) {
        console.error('Error al obtener pedido por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- CREAR UN NUEVO PEDIDO (CON TRANSACCIÓN) ---
export const createOrder = async (req, res) => {
    let connection;
    try {
        const { id_usuario, id_metodo_pago, direccion_envio, detalles_pedido } = req.body;

        if (!id_usuario || !id_metodo_pago || !direccion_envio || !detalles_pedido || detalles_pedido.length === 0) {
            return res.status(400).json({ message: 'Faltan campos obligatorios o detalles del pedido.' });
        }

        // Para transacciones, obtenemos una conexión del pool
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let total_pedido = 0;
        // Validar stock y calcular total
        for (const item of detalles_pedido) {
            const [productRows] = await connection.query('SELECT stock, precio_minorista FROM producto WHERE id_producto = ? FOR UPDATE', [item.id_producto]);
            if (productRows.length === 0) throw new Error(`Producto con ID ${item.id_producto} no encontrado.`);
            if (productRows[0].stock < item.cantidad) throw new Error(`Stock insuficiente para el producto ID ${item.id_producto}.`);
            
            item.precio_unitario = parseFloat(item.precio_unitario || productRows[0].precio_minorista);
            item.sub_total = item.cantidad * item.precio_unitario;
            total_pedido += item.sub_total;
        }

        // Insertar el pedido principal
        const [pedidoResult] = await connection.query('INSERT INTO pedido (id_usuario, id_metodo_pago, direccion_envio, total_pedido, estado_pedido, fecha_pedido) VALUES (?, ?, ?, ?, ?, NOW())', [id_usuario, id_metodo_pago, direccion_envio, total_pedido, 'pendiente']);
        const newPedidoId = pedidoResult.insertId;

        // Insertar detalles y actualizar stock
        for (const item of detalles_pedido) {
            await connection.query('INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, sub_total) VALUES (?, ?, ?, ?, ?)', [newPedidoId, item.id_producto, item.cantidad, item.precio_unitario, item.sub_total]);
            await connection.query('UPDATE producto SET stock = stock - ? WHERE id_producto = ?', [item.cantidad, item.id_producto]);
        }
        
        await connection.commit();
        res.status(201).json({ message: 'Pedido creado exitosamente.', id_pedido: newPedidoId });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error al crear pedido:', error);
        res.status(500).json({ message: error.message || 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release(); // Liberar la conexión de vuelta al pool
    }
};

// --- ACTUALIZAR ESTADO DE UN PEDIDO ---
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_pedido } = req.body;
        if (!estado_pedido) {
            return res.status(400).json({ message: 'El estado del pedido es requerido.' });
        }

        const [result] = await pool.query('UPDATE pedido SET estado_pedido = ? WHERE id_pedido = ?', [estado_pedido, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }
        res.json({ message: 'Estado del pedido actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- ELIMINAR UN PEDIDO (CON TRANSACCIÓN) ---
export const deleteOrder = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [detalles] = await connection.query('SELECT id_producto, cantidad FROM detalle_pedido WHERE id_pedido = ?', [id]);
        
        // Solo restaurar stock si se encontraron detalles
        if (detalles.length > 0) {
            await connection.query('DELETE FROM detalle_pedido WHERE id_pedido = ?', [id]);
            for (const item of detalles) {
                await connection.query('UPDATE producto SET stock = stock + ? WHERE id_producto = ?', [item.cantidad, item.id_producto]);
            }
        }
        
        const [pedidoResult] = await connection.query('DELETE FROM pedido WHERE id_pedido = ?', [id]);
        if (pedidoResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        await connection.commit();
        res.json({ message: 'Pedido eliminado y stock restaurado exitosamente.' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error al eliminar pedido:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
};