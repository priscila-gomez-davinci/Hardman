app.get('/api/metodos-pago', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT id_metodo_pago, nombre_metodo_pago FROM metodo_pago');
        res.json({ metodosPago: rows });
    } catch (error) {
        console.error('Error al obtener métodos de pago:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

// ¿Vamos a hacer un ABM de medios de pago? Y, por las dudas mandale. 


app.post('/api/metodos-pago', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { nombre_metodo_pago } = req.body;
        if (!nombre_metodo_pago) {
            return res.status(400).json({ message: 'El nombre del método de pago es requerido.' });
        }
        const [result] = await connection.execute(
            'INSERT INTO metodo_pago (nombre_metodo_pago) VALUES (?)',
            [nombre_metodo_pago]
        );
        res.status(201).json({ message: 'Método de pago creado exitosamente', id_metodo_pago: result.insertId });
    } catch (error) {
        console.error('Error al crear método de pago:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya existe un método de pago con ese nombre.', error: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear método de pago', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.put('/api/metodos-pago/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const { nombre_metodo_pago } = req.body;
        if (!nombre_metodo_pago) {
            return res.status(400).json({ message: 'El nombre del método de pago es requerido para la actualización.' });
        }
        const [result] = await connection.execute(
            'UPDATE metodo_pago SET nombre_metodo_pago = ? WHERE id_metodo_pago = ?',
            [nombre_metodo_pago, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Método de pago no encontrado.' });
        }
        res.json({ message: 'Método de pago actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar método de pago:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya existe un método de pago con ese nombre.', error: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar método de pago', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

app.delete('/api/metodos-pago/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const [result] = await connection.execute('DELETE FROM metodo_pago WHERE id_metodo_pago = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Método de pago no encontrado.' });
        }
        res.json({ message: 'Método de pago eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar método de pago:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar método de pago', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});
