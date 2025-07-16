import pool from '../config/db.js';

// --- OBTENER TODOS LOS PRODUCTOS ---
export const getAllProducts = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM producto`);
        res.json({ productos: rows });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- OBTENER UN PRODUCTO POR ID ---
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT  
            FROM producto AS p
            WHERE p.id_producto = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ producto: rows[0] });
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- CREAR UN NUEVO PRODUCTO ---
export const createProduct = async (req, res) => {
    try {
        const { nombre_producto, descripcion, precio_minorista, precio_mayorista, stock, imagen_url, sku, activo, id_categoria } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO producto (nombre_producto, descripcion, precio_minorista, precio_mayorista, stock, imagen_url, sku, activo, id_categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre_producto, descripcion || null, precio_minorista, precio_mayorista || null, stock, imagen_url || null, sku, activo !== undefined ? activo : 1, id_categoria]
        );
        res.status(201).json({ message: 'Producto creado exitosamente.', id_producto: result.insertId });
    } catch (error) {
        console.error('Error al crear producto:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya existe un producto con el SKU proporcionado.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- ACTUALIZAR UN PRODUCTO ---
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params; // ID desde la URL
        const { nombre_producto, descripcion, precio_minorista, precio_mayorista, stock, imagen_url, sku, activo, id_categoria } = req.body; // Datos del cuerpo de la petición

        console.log('--- INTENTANDO ACTUALIZAR PRODUCTO EN BACKEND ---');
        console.log('ID recibido en params:', id);
        console.log('Body recibido (req.body):', req.body); // Ver todo el body recibido

        // Parámetros para la consulta SQL (antes de ejecutarla)
        const queryParams = [
            nombre_producto,
            descripcion || null,
            precio_minorista,
            precio_mayorista || null,
            stock,
            imagen_url || null,
            sku,
            activo !== undefined ? activo : 1, // Si activo es undefined, por defecto 1
            id_categoria,
            id // El ID para la cláusula WHERE
        ];
        console.log('Parámetros para la consulta SQL:', queryParams);

        const [result] = await pool.query(
            'UPDATE producto SET nombre_producto = ?, descripcion = ?, precio_minorista = ?, precio_mayorista = ?, stock = ?, imagen_url = ?, sku = ?, activo = ?, id_categoria = ? WHERE id_producto = ?',
            queryParams // Usa los parámetros definidos
        );

        console.log('Resultado de la operación UPDATE en DB:', result);

        if (result.affectedRows === 0) {
            console.warn('Advertencia: Producto no encontrado para actualizar con ID:', id);
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto actualizado exitosamente.' });
        console.log('--- PRODUCTO ACTUALIZADO EXITOSAMENTE EN BACKEND ---');

    } catch (error) {
        console.error('ERROR CRÍTICO en updateProduct (backend):', error); // Aquí verás el error detallado de la DB
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El SKU ya está en uso por otro producto.' });
        }
        // Este else-if es importante para capturar otros errores de DB que no sean ER_DUP_ENTRY
        // Por ejemplo, ER_BAD_NULL_ERROR si intentas poner NULL en un campo NOT NULL
        // o ER_NO_REFERENCED_ROW_2 si id_categoria no existe
        else if (error.code) { // Si es un error de MySQL con un código específico
             return res.status(400).json({ message: `Error de base de datos: ${error.code} - ${error.sqlMessage || error.message}` });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- ELIMINAR UN PRODUCTO ---
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM producto WHERE id_producto = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};