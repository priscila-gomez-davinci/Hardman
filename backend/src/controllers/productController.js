import pool from '../config/db.js';

// --- OBTENER TODOS LOS PRODUCTOS ---
export const getAllProducts = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.nombre_categoria 
            FROM producto AS p
            JOIN categoria AS c ON p.id_categoria = c.id_categoria
        `);
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
            SELECT p.*, c.nombre_categoria 
            FROM producto AS p
            JOIN categoria AS c ON p.id_categoria = c.id_categoria
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

        if (!nombre_producto || !precio_minorista || stock === undefined || !sku || !id_categoria) {
            return res.status(400).json({ message: 'Faltan campos obligatorios.' });
        }
        
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
        const { id } = req.params;
        const { nombre_producto, descripcion, precio_minorista, precio_mayorista, stock, imagen_url, sku, activo, id_categoria } = req.body;

        if (!nombre_producto || !precio_minorista || stock === undefined || !sku || !id_categoria) {
            return res.status(400).json({ message: 'Faltan campos obligatorios.' });
        }

        const [result] = await pool.query(
            'UPDATE producto SET nombre_producto = ?, descripcion = ?, precio_minorista = ?, precio_mayorista = ?, stock = ?, imagen_url = ?, sku = ?, activo = ?, id_categoria = ? WHERE id_producto = ?',
            [nombre_producto, descripcion || null, precio_minorista, precio_mayorista || null, stock, imagen_url || null, sku, activo !== undefined ? activo : 1, id_categoria, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El SKU ya está en uso por otro producto.' });
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