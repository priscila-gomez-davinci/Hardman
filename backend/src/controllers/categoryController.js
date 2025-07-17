import pool from '../config/db.js';

// --- OBTENER TODAS LAS CATEGORÍAS ---
export const getAllCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id_categoria, nombre_categoria, descripcion FROM categoria');
        res.json({ categorias: rows });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- OBTENER UNA CATEGORÍA POR ID ---
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT id_categoria, nombre_categoria, descripcion FROM categoria WHERE id_categoria = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        res.json({ categoria: rows[0] });
    } catch (error) {
        console.error('Error al obtener categoría por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- CREAR UNA NUEVA CATEGORÍA ---
export const createCategory = async (req, res) => {
    try {
        const { nombre_categoria, descripcion } = req.body;
        if (!nombre_categoria) {
            return res.status(400).json({ message: 'El nombre de la categoría es requerido.' });
        }

        const [result] = await pool.query(
            'INSERT INTO categoria (nombre_categoria, descripcion) VALUES (?, ?)',
            [nombre_categoria, descripcion || null]
        );
        res.status(201).json({ message: 'Categoría creada exitosamente.', id_categoria: result.insertId });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya existe una categoría con ese nombre.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- ACTUALIZAR UNA CATEGORÍA ---
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_categoria, descripcion } = req.body;
        if (!nombre_categoria) {
            return res.status(400).json({ message: 'El nombre de la categoría es requerido.' });
        }

        const [result] = await pool.query(
            'UPDATE categoria SET nombre_categoria = ?, descripcion = ? WHERE id_categoria = ?',
            [nombre_categoria, descripcion || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        res.json({ message: 'Categoría actualizada exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya existe una categoría con ese nombre.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- ELIMINAR UNA CATEGORÍA ---
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        // const [products] = await pool.query('SELECT 1 FROM producto WHERE id_categoria = ? LIMIT 1', [id]);
        // if (products.length > 0) {
        //     return res.status(409).json({ message: 'No se puede eliminar la categoría porque está siendo utilizada por uno o más productos.' });
        // }

        const [result] = await pool.query('DELETE FROM categoria WHERE id_categoria = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        res.json({ message: 'Categoría eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};