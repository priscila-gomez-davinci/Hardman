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
        const { id } = req.params; 
        const { nombre_producto, descripcion, precio_minorista, precio_mayorista, stock, imagen_url, sku, activo, id_categoria } = req.body; // Datos del cuerpo de la petición

        console.log('--- INTENTANDO ACTUALIZAR PRODUCTO EN BACKEND ---');
        console.log('ID recibido en params:', id);
        console.log('Body recibido (req.body):', req.body); 

        const queryParams = [
            nombre_producto,
            descripcion || null,
            precio_minorista,
            precio_mayorista || null,
            stock,
            imagen_url || null,
            sku,
            activo !== undefined ? activo : 1, 
            id_categoria,
            id 
        ];
        console.log('Parámetros para la consulta SQL:', queryParams);

        const [result] = await pool.query(
            'UPDATE producto SET nombre_producto = ?, descripcion = ?, precio_minorista = ?, precio_mayorista = ?, stock = ?, imagen_url = ?, sku = ?, activo = ?, id_categoria = ? WHERE id_producto = ?',
            queryParams 
        );

        console.log('Resultado de la operación UPDATE en DB:', result);

        if (result.affectedRows === 0) {
            console.warn('Advertencia: Producto no encontrado para actualizar con ID:', id);
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto actualizado exitosamente.' });
        console.log('--- PRODUCTO ACTUALIZADO EXITOSAMENTE EN BACKEND ---');

    } catch (error) {
        console.error('ERROR CRÍTICO en updateProduct (backend):', error); 
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El SKU ya está en uso por otro producto.' });
        }
        else if (error.code) { 
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