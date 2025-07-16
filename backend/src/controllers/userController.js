// src/controllers/userController.js
import pool from '../config/db.js';
import bcrypt from 'bcrypt'; // Necesario para hashear contraseñas si un admin crea/modifica una nueva

const saltRounds = 10;

// --- OBTENER TODOS LOS USUARIOS ---
export const getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                u.id_usuario,
                u.nombre,
                u.apellido,
                u.email,
                u.telefono,
                u.direccion,
                u.ciudad,
                u.provincia,
                u.fecha_registro,
                u.usuario_activo,
                u.id_rol,
                r.nombre_rol AS role_name -- Traer el nombre del rol para el frontend
            FROM
                usuario AS u
            JOIN
                rol AS r ON u.id_rol = r.id_rol;
        `);
        res.json({ users: rows });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- OBTENER UN USUARIO POR ID ---
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT
                u.id_usuario,
                u.nombre,
                u.apellido,
                u.email,
                u.telefono,
                u.direccion,
                u.ciudad,
                u.provincia,
                u.fecha_registro,
                u.usuario_activo,
                u.id_rol,
                r.nombre_rol AS role_name
            FROM
                usuario AS u
            JOIN
                rol AS r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = ?;
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json({ user: rows[0] });
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- CREAR UN NUEVO USUARIO (desde admin, dif. del registro público) ---
export const createUser = async (req, res) => {
    try {
        const { nombre, apellido, email, password, telefono, direccion, ciudad, provincia, usuario_activo, id_rol } = req.body;

        if (!nombre || !apellido || !email || !password || !id_rol) {
            return res.status(400).json({ message: 'Nombre, apellido, email, contraseña y rol son obligatorios.' });
        }

        const [existingUser] = await pool.query('SELECT id_usuario FROM usuario WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [result] = await pool.query(
            `INSERT INTO usuario (
                nombre, apellido, email, password, telefono, direccion, ciudad, provincia, fecha_registro, usuario_activo, id_rol
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?);`,
            [
                nombre, apellido, email, hashedPassword,
                telefono || null, direccion || null, ciudad || null, provincia || null,
                usuario_activo !== undefined ? usuario_activo : 1, // Por defecto activo
                id_rol
            ]
        );
        res.status(201).json({ message: 'Usuario creado exitosamente.', id_usuario: result.insertId });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear usuario.' });
    }
};

// --- ACTUALIZAR UN USUARIO ---
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, password, telefono, direccion, ciudad, provincia, usuario_activo, id_rol } = req.body;

        // Si se proporciona una nueva contraseña, hashearla
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        const updateFields = [];
        const updateValues = [];

        if (nombre !== undefined) { updateFields.push('nombre = ?'); updateValues.push(nombre); }
        if (apellido !== undefined) { updateFields.push('apellido = ?'); updateValues.push(apellido); }
        if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(email); }
        if (hashedPassword !== null) { updateFields.push('password = ?'); updateValues.push(hashedPassword); }
        if (telefono !== undefined) { updateFields.push('telefono = ?'); updateValues.push(telefono || null); }
        if (direccion !== undefined) { updateFields.push('direccion = ?'); updateValues.push(direccion || null); }
        if (ciudad !== undefined) { updateFields.push('ciudad = ?'); updateValues.push(ciudad || null); }
        if (provincia !== undefined) { updateFields.push('provincia = ?'); updateValues.push(provincia || null); }
        if (usuario_activo !== undefined) { updateFields.push('usuario_activo = ?'); updateValues.push(usuario_activo); }
        if (id_rol !== undefined) { updateFields.push('id_rol = ?'); updateValues.push(id_rol); }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No hay datos para actualizar.' });
        }

        const query = `UPDATE usuario SET ${updateFields.join(', ')} WHERE id_usuario = ?`;
        const [result] = await pool.query(query, [...updateValues, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado o no se realizaron cambios.' });
        }
        res.json({ message: 'Usuario actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar usuario.' });
    }
};

// --- ELIMINAR UN USUARIO ---
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json({ message: 'Usuario eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar usuario.' });
    }
};