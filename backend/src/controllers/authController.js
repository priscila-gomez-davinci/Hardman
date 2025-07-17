import pool from '../config/db.js';
import bcrypt from 'bcrypt'; 

const saltRounds = 10;

/**
 * Controlador para la autenticación de usuarios (Login).
 * Ahora usa bcrypt para comparar la contraseña ingresada con el hash almacenado.
 */
export const loginUser = async (req, res) => {
    const { email, password } = req.query; 

    if (!email || !password) {
        return res.status(400).json({ message: 'Se requieren email y contraseña.' });
    }

    try {
        const [rows] = await pool.query(`
            SELECT
                u.id_usuario,
                u.nombre,
                u.apellido,
                u.email,
                u.password AS hashedPassword, -- ¡Asegúrate de seleccionar la contraseña hasheada!
                r.nombre_rol AS role
            FROM
                usuario AS u
            JOIN
                rol AS r ON u.id_rol = r.id_rol
            WHERE
                u.email = ?;
        `, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = rows[0]; 
        const isMatch = await bcrypt.compare(password, user.hashedPassword);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        res.json({
            id: user.id_usuario,
            name: user.nombre,
            lastName: user.apellido,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        console.error('Error al intentar iniciar sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const registerUser = async (req, res) => {
    const { nombre, apellido, email, password, telefono, direccion, ciudad, provincia } = req.body;

    if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos obligatorios (nombre, apellido, email, contraseña) deben ser completados.' });
    }

    try {
        const [existingUser] = await pool.query('SELECT id_usuario FROM usuario WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [userRoleRows] = await pool.query("SELECT id_rol FROM rol WHERE nombre_rol = 'user'");
        let id_rol_usuario;
        if (userRoleRows.length > 0) {
            id_rol_usuario = userRoleRows[0].id_rol;
        } else {
            console.error("Error: El rol 'user' no se encontró en la tabla 'rol'.");
            return res.status(500).json({ message: 'Error en la configuración del servidor: rol de usuario no definido.' });
        }

        const [result] = await pool.query(
            `INSERT INTO usuario (
                nombre,
                apellido,
                email,
                password, -- Aquí se guarda el hash de la contraseña
                telefono,
                direccion,
                ciudad,
                provincia,
                fecha_registro,
                usuario_activo,
                id_rol
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?);`,
            [
                nombre,
                apellido,
                email,
                hashedPassword, // Usamos la contraseña hasheada
                telefono || null, // Si telefono es nulo/vacío, guarda NULL en DB
                direccion || null,
                ciudad || null,
                provincia || null,
                1, // usuario_activo: 1 por defecto para usuarios nuevos
                id_rol_usuario // Asignar el id del rol 'user'
            ]
        );

        // 5. Respuesta exitosa
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            userId: result.insertId,
            email: email
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al registrar el usuario.' });
    }
};