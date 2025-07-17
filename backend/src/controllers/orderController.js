import pool from '../config/db.js';



const generateTrackingNumber = () => {
    const min = 1_000_000_000; // Usando separadores para legibilidad (JS los ignora)
    const max = 2_000_000_000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
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


export const createOrder = async (req, res) => {
    let connection;

    try {
        const {
            id_usuario,
            direccion_envio,
            total_pedido,
            items
        } = req.body;

        // --- Logs de depuración ---
        console.log('\n--- RECIBIENDO NUEVO PEDIDO EN BACKEND ---');
        console.log('req.body completo recibido:', req.body);
        console.log('Valor de "items" después de desestructurar:', items);
        console.log('¿"items" es un Array?', Array.isArray(items));

        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error('Error: "items" no es un array válido o está vacío en el body de la petición.');
            return res.status(400).json({ message: 'El pedido debe contener al menos un ítem y estar en formato correcto.' });
        }
        if (!direccion_envio) {
            return res.status(400).json({ message: 'La dirección de envío es obligatoria.' });
        }
        if (!req.body.nombre_cliente || !req.body.email_cliente) {
            return res.status(400).json({ message: 'Nombre y email del cliente son obligatorios para el pedido.' });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const numeroDeSeguimiento = generateTrackingNumber();
        console.log('Número de seguimiento generado (aprox. 10 dígitos):', numeroDeSeguimiento);


        const [orderResult] = await connection.query(
            `INSERT INTO pedido (
                id_usuario,
                fecha_pedido,
                estado_pedido,
                total_pedido,
                direccion_envio,
                numero_de_seguimiento  -- Esta columna es int(100)
            ) VALUES (?, NOW(), ?, ?, ?, ?);`,
            [
                id_usuario || null,
                'pendiente',
                total_pedido,
                direccion_envio,
                numeroDeSeguimiento 
            ]
        );
        const id_pedido_creado = orderResult.insertId;

        // 2. Insertar los detalles del pedido en la tabla `detalle_pedido`
        for (const item of items) {
            if (!item.id_producto || !item.cantidad || !item.precio_unitario) {
                throw new Error(`Ítem de pedido inválido: faltan id_producto, cantidad o precio_unitario para el ítem ${JSON.stringify(item)}`);
            }
            if (item.cantidad <= 0 || item.precio_unitario < 0) {
                 throw new Error(`Ítem de pedido inválido: cantidad o precio no válidos para el ítem ${JSON.stringify(item)}`);
            }
            const sub_total = item.cantidad * item.precio_unitario;

            await connection.query(
                `INSERT INTO detalle_pedido (
                    id_pedido, id_producto, cantidad, precio_unitario, sub_total
                ) VALUES (?, ?, ?, ?, ?);`,
                [id_pedido_creado, item.id_producto, item.cantidad, item.precio_unitario, sub_total]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: 'Pedido realizado con éxito.',
            id_pedido: id_pedido_creado,
            numero_de_seguimiento: numeroDeSeguimiento // También lo devuelves en la respuesta
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('ERROR CRÍTICO al crear pedido (backend):', error);
        if (error.code && error.sqlMessage) {
            return res.status(400).json({ message: `Error de base de datos: ${error.code} - ${error.sqlMessage}` });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear el pedido.' });
    } finally {
        if (connection) {
            connection.release();
        }
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

export const getUserActiveCartOrCreate = async (req, res) => {
    const { userId } = req.params; // Para usuario logueado
    // ... (resto de la lógica para buscar/crear el carrito) ...

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let pedidoId;
        // Lógica para encontrar o crear un pedido de estado 'carrito'
        if (userId && userId !== 'guest') { // Si es un usuario logueado
            const [existingCart] = await connection.query(
                `SELECT id_pedido FROM pedido WHERE id_usuario = ? AND estado_pedido = 'carrito';`,
                [userId]
            );
            if (existingCart.length > 0) {
                pedidoId = existingCart[0].id_pedido;
            } else {
                const [newCartResult] = await connection.query(
                    `INSERT INTO pedido (id_usuario, fecha_pedido, estado_pedido, total_pedido) VALUES (?, NOW(), 'carrito', 0);`,
                    [userId]
                );
                pedidoId = newCartResult.insertId;
            }
        } else { // Para usuario invitado (guest)
            const [newCartResult] = await connection.query(
                `INSERT INTO pedido (fecha_pedido, estado_pedido, total_pedido) VALUES (NOW(), 'carrito', 0);`
            );
            pedidoId = newCartResult.insertId;
        }

        // Obtener los ítems de ese carrito
        const [itemsResult] = await connection.query(`
            SELECT
                dp.id_detalle_pedido,
                dp.id_producto,
                p.nombre_producto AS product_name,
                p.imagen_url AS product_image,
                dp.cantidad,
                dp.precio_unitario,
                dp.sub_total
            FROM
                detalle_pedido AS dp
            JOIN
                producto AS p ON dp.id_producto = p.id_producto
            WHERE dp.id_pedido = ?;
        `, [pedidoId]);

        await connection.commit();
        res.status(200).json({
            pedidoId: pedidoId,
            cartItems: itemsResult.map(item => ({
                id: item.id_producto,
                name: item.product_name,
                image: item.product_image,
                quantity: item.cantidad,
                price: parseFloat(item.precio_unitario),
                subTotal: parseFloat(item.sub_total),
                detalleId: item.id_detalle_pedido
            }))
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error al obtener/crear carrito activo:', error);
        res.status(500).json({ message: 'Error interno del servidor al gestionar el carrito.' });
    } finally {
        if (connection) connection.release();
    }
};