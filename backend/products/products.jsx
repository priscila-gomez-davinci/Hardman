// Cargar variables de entorno al principio
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise'); // Usamos la versión con promesas para async/await
const cors = require('cors'); // Para habilitar CORS

const app = express();
const port = process.env.PORT || 3000; // Puedes configurar el puerto en .env o usar 3000 por defecto

// Middleware para habilitar CORS
// Esto es importante si tu frontend está en un dominio diferente (ej. React en localhost:5173 y backend en localhost:3000)
app.use(cors());

// Middleware para parsear JSON en el cuerpo de las peticiones
app.use(express.json());

// --- Configuración de la Conexión a la Base de Datos ---
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

// Función para obtener una conexión a la DB
async function getConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conectado a la base de datos MySQL');
        return connection;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error;
    }
}

// --- Rutas de la API ---

// Ruta para obtener todos los productos 
app.get('/api/products', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        const [rows] = await connection.execute(`
            SELECT
                u.id,
                u.name,
                u.email,
                u.password,
                r.name AS role
            FROM
                products AS p
            JOIN
                roles AS r ON u.role_id = r.id
        `);

        // Formateamos la respuesta
        res.json({ users: rows });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) {
            await connection.end(); // Cerrar la conexión para liberar recursos
        }
    }
});

// --- Métodos ABM para usuarios ---

// 1. Crear un nuevo usuario (Alta)
app.post('/api/products', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { name, email, password, role_id } = req.body; // Asume que role_id viene en el body

        if (!name || !email || !password || !role_id) {
            return res.status(400).json({ message: 'Todos los campos (name, email, password, role_id) son requeridos.' });
        }

        // Aquí podrías agregar un hash a la contraseña antes de guardarla (ej. con bcrypt)
        // const hashedPassword = await bcrypt.hash(password, 10); // Necesitarías instalar bcrypt

        const [result] = await connection.execute(
            'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
            [name, email, password, role_id]
        );

        res.status(201).json({ message: 'Usuario creado exitosamente', userId: result.insertId });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        // Manejo específico para error de email duplicado
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El email ya está registrado.', error: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear usuario', error: error.message });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// 2. Actualizar un usuario existente (Modificación)
app.put('/api/products/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const { name, email, password, role_id } = req.body;

        if (!name || !email || !password || !role_id) {
            return res.status(400).json({ message: 'Todos los campos (name, email, password, role_id) son requeridos para la actualización.' });
        }

        // Aquí podrías agregar un hash a la contraseña si también se actualiza
        // const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await connection.execute(
            'UPDATE users SET name = ?, email = ?, password = ?, role_id = ? WHERE id = ?',
            [name, email, password, role_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.json({ message: 'Usuario actualizado exitosamente' });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El email ya está registrado.', error: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar usuario', error: error.message });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// 3. Eliminar un usuario (Baja)
app.delete('/api/products/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;

        const [result] = await connection.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.json({ message: 'Usuario eliminado exitosamente' });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar usuario', error: error.message });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// --- Iniciar el Servidor ---
app.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
    console.log(`Puedes probar la API de usuarios en http://localhost:${port}/api/users`);
    console.log(`Para crear un usuario: POST http://localhost:${port}/api/users`);
    console.log(`Para actualizar un usuario: PUT http://localhost:${port}/api/users/:id`);
    console.log(`Para eliminar un usuario: DELETE http://localhost:${port}/api/users/:id`);
    console.log(`Para login: POST http://localhost:${port}/api/login`);
});