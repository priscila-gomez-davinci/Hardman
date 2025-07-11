// --- Rutas ABM para Categorías de Reparación ---

// Obtener todas las categorías de reparación
app.get('/api/categorias-reparacion', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT id_categoria_reparacion, nombre_categoria FROM categoria_reparacion');
        res.json({ categoriasReparacion: rows });
    } catch (error) {
        console.error('Error al obtener categorías de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

// Obtener una categoría de reparación por ID
app.get('/api/categorias-reparacion/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const [rows] = await connection.execute('SELECT id_categoria_reparacion, nombre_categoria FROM categoria_reparacion WHERE id_categoria_reparacion = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Categoría de reparación no encontrada.' });
        }
        res.json({ categoriaReparacion: rows[0] });
    } catch (error) {
        console.error('Error al obtener categoría de reparación por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

// Crear una nueva categoría de reparación
app.post('/api/categorias-reparacion', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { nombre_categoria } = req.body;
        if (!nombre_categoria) {
            return res.status(400).json({ message: 'El nombre de la categoría de reparación es requerido.' });
        }
        const [result] = await connection.execute(
            'INSERT INTO categoria_reparacion (nombre_categoria) VALUES (?)',
            [nombre_categoria]
        );
        res.status(201).json({ message: 'Categoría de reparación creada exitosamente', id_categoria_reparacion: result.insertId });
    } catch (error) {
        console.error('Error al crear categoría de reparación:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya existe una categoría de reparación con ese nombre.', error: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear categoría de reparación', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

// Actualizar una categoría de reparación existente
app.put('/api/categorias-reparacion/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const { nombre_categoria } = req.body;
        if (!nombre_categoria) {
            return res.status(400).json({ message: 'El nombre de la categoría de reparación es requerido para la actualización.' });
        }
        const [result] = await connection.execute(
            'UPDATE categoria_reparacion SET nombre_categoria = ? WHERE id_categoria_reparacion = ?',
            [nombre_categoria, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría de reparación no encontrada.' });
        }
        res.json({ message: 'Categoría de reparación actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar categoría de reparación:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya existe una categoría de reparación con ese nombre.', error: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar categoría de reparación', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

// Eliminar una categoría de reparación
app.delete('/api/categorias-reparacion/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const [result] = await connection.execute('DELETE FROM categoria_reparacion WHERE id_categoria_reparacion = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría de reparación no encontrada.' });
        }
        res.json({ message: 'Categoría de reparación eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar categoría de reparación:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar categoría de reparación', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});