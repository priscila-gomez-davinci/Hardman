
app.get('/api/categorias', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT id_categoria, nombre_categoria, descripcion FROM categoria');
        res.json({ categorias: rows });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.get('/api/categorias/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const [rows] = await connection.execute('SELECT id_categoria, nombre_categoria, descripcion FROM categoria WHERE id_categoria = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        res.json({ categoria: rows[0] });
    } catch (error) {
        console.error('Error al obtener categoría por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.post('/api/categorias', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { nombre_categoria, descripcion } = req.body;
        if (!nombre_categoria) {
            return res.status(400).json({ message: 'El nombre de la categoría es requerido.' });
        }
        const [result] = await connection.execute(
            'INSERT INTO categoria (nombre_categoria, descripcion) VALUES (?, ?)',
            [nombre_categoria, descripcion || null]
        );
        res.status(201).json({ message: 'Categoría creada exitosamente', id_categoria: result.insertId });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya existe una categoría con ese nombre.', error: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear categoría', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.put('/api/categorias/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const { nombre_categoria, descripcion } = req.body;
        if (!nombre_categoria) {
            return res.status(400).json({ message: 'El nombre de la categoría es requerido para la actualización.' });
        }
        const [result] = await connection.execute(
            'UPDATE categoria SET nombre_categoria = ?, descripcion = ? WHERE id_categoria = ?',
            [nombre_categoria, descripcion || null, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        res.json({ message: 'Categoría actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya existe una categoría con ese nombre.', error: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar categoría', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.delete('/api/categorias/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const [result] = await connection.execute('DELETE FROM categoria WHERE id_categoria = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar categoría', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});