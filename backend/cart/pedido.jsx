app.get('/api/pedidos', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [pedidos] = await connection.execute(`
            SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.estado_pedido,
                p.total_pedido,
                p.direccion_envio,
                p.numero_seguimiento,
                p.id_usuario,
                u.name AS nombre_usuario,
                u.email AS email_usuario,
                p.id_metodo_pago,
                mp.nombre_metodo_pago
            FROM
                pedido AS p
            JOIN
                users AS u ON p.id_usuario = u.id
            JOIN
                metodo_pago AS mp ON p.id_metodo_pago = mp.id_metodo_pago
        `);

        for (let pedido of pedidos) {
            const [detalles] = await connection.execute(`
                SELECT
                    dp.id_detalle_pedido,
                    dp.id_producto,
                    prod.nombre_producto,
                    prod.sku,
                    dp.cantidad,
                    dp.precio_unitario,
                    dp.sub_total
                FROM
                    detalle_pedido AS dp
                JOIN
                    producto AS prod ON dp.id_producto = prod.id_producto
                WHERE
                    dp.id_pedido = ?
            `, [pedido.id_pedido]);
            pedido.detalles = detalles;
        }

        res.json({ pedidos: pedidos });
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.get('/api/pedidos/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;

        const [pedidos] = await connection.execute(`
            SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.estado_pedido,
                p.total_pedido,
                p.direccion_envio,
                p.numero_seguimiento,
                p.id_usuario,
                u.name AS nombre_usuario,
                u.email AS email_usuario,
                p.id_metodo_pago,
                mp.nombre_metodo_pago
            FROM
                pedido AS p
            JOIN
                users AS u ON p.id_usuario = u.id
            JOIN
                metodo_pago AS mp ON p.id_metodo_pago = mp.id_metodo_pago
            WHERE
                p.id_pedido = ?
        `, [id]);

        const pedido = pedidos[0];
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        const [detalles] = await connection.execute(`
            SELECT
                dp.id_detalle_pedido,
                dp.id_producto,
                prod.nombre_producto,
                prod.sku,
                dp.cantidad,
                dp.precio_unitario,
                dp.sub_total
            FROM
                detalle_pedido AS dp
            JOIN
                producto AS prod ON dp.id_producto = prod.id_producto
            WHERE
                dp.id_pedido = ?
        `, [pedido.id_pedido]);
        pedido.detalles = detalles;

        res.json({ pedido: pedido });
    } catch (error) {
        console.error('Error al obtener pedido por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.post('/api/pedidos', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        await connection.beginTransaction(); 

        const {
            id_usuario,
            id_metodo_pago,
            direccion_envio,
            detalles_pedido 
        } = req.body;

        if (!id_usuario || !id_metodo_pago || !direccion_envio || !detalles_pedido || detalles_pedido.length === 0) {
            return res.status(400).json({ message: 'Faltan campos obligatorios para crear un pedido o no hay detalles de pedido.' });
        }

        const [userRows] = await connection.execute('SELECT id FROM users WHERE id = ?', [id_usuario]);
        if (userRows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'El usuario especificado no existe.' });
        }
        const [metodoPagoRows] = await connection.execute('SELECT id_metodo_pago FROM metodo_pago WHERE id_metodo_pago = ?', [id_metodo_pago]);
        if (metodoPagoRows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'El método de pago especificado no existe.' });
        }

        let total_pedido = 0;

        for (const item of detalles_pedido) {
            const [productRows] = await connection.execute('SELECT id_producto, precio_minorista, stock FROM producto WHERE id_producto = ? AND activo = 1', [item.id_producto]);
            if (productRows.length === 0) {
                await connection.rollback();
                return res.status(400).json({ message: `Producto con ID ${item.id_producto} no encontrado o inactivo.` });
            }
            const product = productRows[0];

            if (item.cantidad <= 0) {
                await connection.rollback();
                return res.status(400).json({ message: `La cantidad para el producto ${item.id_producto} debe ser mayor a 0.` });
            }

            if (product.stock < item.cantidad) {
                await connection.rollback();
                return res.status(400).json({ message: `Stock insuficiente para el producto ${product.nombre_producto}. Stock disponible: ${product.stock}` });
            }

            item.precio_unitario = parseFloat(item.precio_unitario || product.precio_minorista); // Usar precio del producto si no viene
            item.sub_total = parseFloat((item.cantidad * item.precio_unitario).toFixed(2));
            total_pedido += item.sub_total;
        }

        // Insertar en la tabla 'pedido'
        const [pedidoResult] = await connection.execute(
            `INSERT INTO pedido (fecha_pedido, estado_pedido, total_pedido, direccion_envio, numero_seguimiento, id_usuario, id_metodo_pago)
             VALUES (NOW(), ?, ?, ?, ?, ?, ?)`,
            ['pendiente', parseFloat(total_pedido.toFixed(2)), direccion_envio, null, id_usuario, id_metodo_pago]
        );
        const newPedidoId = pedidoResult.insertId;

        for (const item of detalles_pedido) {
            await connection.execute(
                `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, sub_total)
                 VALUES (?, ?, ?, ?, ?)`,
                [newPedidoId, item.id_producto, item.cantidad, item.precio_unitario, item.sub_total]
            );
            await connection.execute(
                'UPDATE producto SET stock = stock - ? WHERE id_producto = ?',
                [item.cantidad, item.id_producto]
            );
        }

        await connection.commit(); 
        res.status(201).json({ message: 'Pedido creado exitosamente', id_pedido: newPedidoId });

    } catch (error) {
        console.error('Error al crear pedido:', error);
        if (connection) {
            await connection.rollback(); 
            console.warn('Transacción de pedido revertida.');
        }
        res.status(500).json({ message: 'Error interno del servidor al crear pedido', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.put('/api/pedidos/:id/estado', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const { estado_pedido } = req.body;

        if (!estado_pedido) {
            return res.status(400).json({ message: 'El estado del pedido es requerido.' });
        }

        const [result] = await connection.execute(
            'UPDATE pedido SET estado_pedido = ? WHERE id_pedido = ?',
            [estado_pedido, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }
        res.json({ message: 'Estado del pedido actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar estado del pedido', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.delete('/api/pedidos/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        await connection.beginTransaction(); 

        const { id } = req.params;

        // 1. Obtener los detalles del pedido para restaurar el stock
        const [detalles] = await connection.execute('SELECT id_producto, cantidad FROM detalle_pedido WHERE id_pedido = ?', [id]);

        // 2. Eliminar los detalles del pedido
        const [deleteDetallesResult] = await connection.execute('DELETE FROM detalle_pedido WHERE id_pedido = ?', [id]);
        if (deleteDetallesResult.affectedRows === 0 && detalles.length > 0) {
             await connection.rollback();
             return res.status(500).json({ message: 'Error al eliminar los detalles del pedido.' });
        }

        // 3. Eliminar el pedido
        const [deletePedidoResult] = await connection.execute('DELETE FROM pedido WHERE id_pedido = ?', [id]);
        if (deletePedidoResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        // 4. Restaurar el stock de los productos
        for (const item of detalles) {
            await connection.execute(
                'UPDATE producto SET stock = stock + ? WHERE id_producto = ?',
                [item.cantidad, item.id_producto]
            );
        }

        await connection.commit(); 
        res.json({ message: 'Pedido y sus detalles eliminados exitosamente. Stock restaurado.' });

    } catch (error) {
        console.error('Error al eliminar pedido:', error);
        if (connection) {
            await connection.rollback(); 
            console.warn('Transacción de eliminación de pedido revertida.');
        }
        res.status(500).json({ message: 'Error interno del servidor al eliminar pedido', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});