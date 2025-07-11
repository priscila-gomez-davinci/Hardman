
app.get('/api/productos', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT
                p.id_producto,
                p.nombre_producto,
                p.descripcion,
                p.precio_minorista,
                p.precio_mayorista,
                p.stock,
                p.imagen_url,
                p.sku,
                p.activo,
                p.id_categoria,
                c.nombre_categoria
            FROM
                producto AS p
            JOIN
                categoria AS c ON p.id_categoria = c.id_categoria
        `);
        res.json({ productos: rows });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.get('/api/productos/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const [rows] = await connection.execute(`
            SELECT
                p.id_producto,
                p.nombre_producto,
                p.descripcion,
                p.precio_minorista,
                p.precio_mayorista,
                p.stock,
                p.imagen_url,
                p.sku,
                p.activo,
                p.id_categoria,
                c.nombre_categoria
            FROM
                producto AS p
            JOIN
                categoria AS c ON p.id_categoria = c.id_categoria
            WHERE
                p.id_producto = ?
        `, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ producto: rows[0] });
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.post('/api/productos', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { nombre_producto, descripcion, precio_minorista, precio_mayorista, stock, imagen_url, sku, activo, id_categoria } = req.body;

        if (!nombre_producto || !precio_minorista || !precio_mayorista || stock === undefined || !sku || !id_categoria) {
            return res.status(400).json({ message: 'Faltan campos obligatorios para crear un producto (nombre_producto, precio_minorista, precio_mayorista, stock, sku, id_categoria).' });
        }

        const [categoriaRows] = await connection.execute('SELECT id_categoria FROM categoria WHERE id_categoria = ?', [id_categoria]);
        if (categoriaRows.length === 0) {
            return res.status(400).json({ message: 'La categoría especificada no existe.' });
        }

        const [result] = await connection.execute(
            `INSERT INTO producto (nombre_producto, descripcion, precio_minorista, precio_mayorista, stock, imagen_url, sku, activo, id_categoria)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre_producto,
                descripcion || null,
                precio_minorista,
                precio_mayorista,
                stock,
                imagen_url || null,
                sku,
                activo !== undefined ? activo : 1, 
                id_categoria
            ]
        );
        res.status(201).json({ message: 'Producto creado exitosamente', id_producto: result.insertId });
    } catch (error) {
        console.error('Error al crear producto:', error);
        if (error.code === 'ER_DUP_ENTRY' && error.message.includes('sku')) {
            return res.status(409).json({ message: 'Ya existe un producto con el SKU proporcionado.', error: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear producto', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.put('/api/productos/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const { nombre_producto, descripcion, precio_minorista, precio_mayorista, stock, imagen_url, sku, activo, id_categoria } = req.body;

        if (!nombre_producto || !precio_minorista || !precio_mayorista || stock === undefined || !sku || !id_categoria) {
            return res.status(400).json({ message: 'Todos los campos obligatorios son requeridos para la actualización.' });
        }

        const [categoriaRows] = await connection.execute('SELECT id_categoria FROM categoria WHERE id_categoria = ?', [id_categoria]);
        if (categoriaRows.length === 0) {
            return res.status(400).json({ message: 'La categoría especificada no existe.' });
        }

        const [result] = await connection.execute(
            `UPDATE producto SET
                nombre_producto = ?,
                descripcion = ?,
                precio_minorista = ?,
                precio_mayorista = ?,
                stock = ?,
                imagen_url = ?,
                sku = ?,
                activo = ?,
                id_categoria = ?
             WHERE id_producto = ?`,
            [
                nombre_producto,
                descripcion || null,
                precio_minorista,
                precio_mayorista,
                stock,
                imagen_url || null,
                sku,
                activo !== undefined ? activo : 1,
                id_categoria,
                id
            ]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        if (error.code === 'ER_DUP_ENTRY' && error.message.includes('sku')) {
            return res.status(409).json({ message: 'El SKU ya está en uso por otro producto.', error: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar producto', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const [result] = await connection.execute('DELETE FROM producto WHERE id_producto = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar producto', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});