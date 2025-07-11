
app.get('/api/pedidos-reparacion', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT
                pr.id_pedido_reparacion,
                pr.nombre_cliente,
                pr.email_cliente,
                pr.telefono_cliente,
                pr.descripcion,
                pr.fecha_solicitud,
                pr.estado_reparacion,
                pr.id_usuario_cliente,
                uc.name AS nombre_usuario_cliente,
                pr.id_usuario_tecnico,
                ut.name AS nombre_usuario_tecnico,
                pr.id_categoria_reparacion,
                cr.nombre_categoria AS nombre_categoria_reparacion
            FROM
                pedido_reparacion AS pr
            LEFT JOIN
                users AS uc ON pr.id_usuario_cliente = uc.id
            LEFT JOIN
                users AS ut ON pr.id_usuario_tecnico = ut.id
            JOIN
                categoria_reparacion AS cr ON pr.id_categoria_reparacion = cr.id_categoria_reparacion
        `);
        res.json({ pedidosReparacion: rows });
    } catch (error) {
        console.error('Error al obtener pedidos de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.get('/api/pedidos-reparacion/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const [rows] = await connection.execute(`
            SELECT
                pr.id_pedido_reparacion,
                pr.nombre_cliente,
                pr.email_cliente,
                pr.telefono_cliente,
                pr.descripcion,
                pr.fecha_solicitud,
                pr.estado_reparacion,
                pr.id_usuario_cliente,
                uc.name AS nombre_usuario_cliente,
                pr.id_usuario_tecnico,
                ut.name AS nombre_usuario_tecnico,
                pr.id_categoria_reparacion,
                cr.nombre_categoria AS nombre_categoria_reparacion
            FROM
                pedido_reparacion AS pr
            LEFT JOIN
                users AS uc ON pr.id_usuario_cliente = uc.id
            LEFT JOIN
                users AS ut ON pr.id_usuario_tecnico = ut.id
            JOIN
                categoria_reparacion AS cr ON pr.id_categoria_reparacion = cr.id_categoria_reparacion
            WHERE
                pr.id_pedido_reparacion = ?
        `, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pedido de reparación no encontrado.' });
        }
        res.json({ pedidoReparacion: rows[0] });
    } catch (error) {
        console.error('Error al obtener pedido de reparación por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.post('/api/pedidos-reparacion', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const {
            nombre_cliente,
            email_cliente,
            telefono_cliente,
            descripcion,
            estado_reparacion, 
            id_usuario_cliente, 
            id_usuario_tecnico, 
            id_categoria_reparacion
        } = req.body;

        if (!nombre_cliente || !email_cliente || !telefono_cliente || !descripcion || !id_categoria_reparacion) {
            return res.status(400).json({ message: 'Faltan campos obligatorios para crear un pedido de reparación.' });
        }

        const [categoriaRepRows] = await connection.execute('SELECT id_categoria_reparacion FROM categoria_reparacion WHERE id_categoria_reparacion = ?', [id_categoria_reparacion]);
        if (categoriaRepRows.length === 0) {
            return res.status(400).json({ message: 'La categoría de reparación especificada no existe.' });
        }

        if (id_usuario_cliente) {
            const [userClientRows] = await connection.execute('SELECT id FROM users WHERE id = ?', [id_usuario_cliente]);
            if (userClientRows.length === 0) {
                return res.status(400).json({ message: 'El usuario cliente especificado no existe.' });
            }
        }

        const [result] = await connection.execute(
            `INSERT INTO pedido_reparacion (nombre_cliente, email_cliente, telefono_cliente, descripcion, fecha_solicitud, estado_reparacion, id_usuario_cliente, id_usuario_tecnico, id_categoria_reparacion)
             VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
            [
                nombre_cliente,
                email_cliente,
                telefono_cliente,
                descripcion,
                estado_reparacion || 'pendiente', 
                id_usuario_cliente || null,
                id_usuario_tecnico || null,
                id_categoria_reparacion
            ]
        );
        res.status(201).json({ message: 'Pedido de reparación creado exitosamente', id_pedido_reparacion: result.insertId });
    } catch (error) {
        console.error('Error al crear pedido de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear pedido de reparación', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.put('/api/pedidos-reparacion/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const {
            nombre_cliente,
            email_cliente,
            telefono_cliente,
            descripcion,
            estado_reparacion,
            id_usuario_cliente,
            id_usuario_tecnico,
            id_categoria_reparacion
        } = req.body;

        if (!nombre_cliente || !email_cliente || !telefono_cliente || !descripcion || !estado_reparacion || !id_categoria_reparacion) {
            return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar un pedido de reparación.' });
        }

        const [categoriaRepRows] = await connection.execute('SELECT id_categoria_reparacion FROM categoria_reparacion WHERE id_categoria_reparacion = ?', [id_categoria_reparacion]);
        if (categoriaRepRows.length === 0) {
            return res.status(400).json({ message: 'La categoría de reparación especificada no existe.' });
        }
        if (id_usuario_cliente) {
            const [userClientRows] = await connection.execute('SELECT id FROM users WHERE id = ?', [id_usuario_cliente]);
            if (userClientRows.length === 0) {
                return res.status(400).json({ message: 'El usuario cliente especificado no existe.' });
            }
        }
        if (id_usuario_tecnico) {
            const [userTechRows] = await connection.execute('SELECT id FROM users WHERE id = ?', [id_usuario_tecnico]);
            if (userTechRows.length === 0) {
                return res.status(400).json({ message: 'El usuario técnico especificado no existe.' });
            }
        }


        const [result] = await connection.execute(
            `UPDATE pedido_reparacion SET
                nombre_cliente = ?,
                email_cliente = ?,
                telefono_cliente = ?,
                descripcion = ?,
                estado_reparacion = ?,
                id_usuario_cliente = ?,
                id_usuario_tecnico = ?,
                id_categoria_reparacion = ?
             WHERE id_pedido_reparacion = ?`,
            [
                nombre_cliente,
                email_cliente,
                telefono_cliente,
                descripcion,
                estado_reparacion,
                id_usuario_cliente || null,
                id_usuario_tecnico || null,
                id_categoria_reparacion,
                id
            ]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido de reparación no encontrado.' });
        }
        res.json({ message: 'Pedido de reparación actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar pedido de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar pedido de reparación', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.delete('/api/pedidos-reparacion/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const [result] = await connection.execute('DELETE FROM pedido_reparacion WHERE id_pedido_reparacion = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido de reparación no encontrado.' });
        }
        res.json({ message: 'Pedido de reparación eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar pedido de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar pedido de reparación', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});