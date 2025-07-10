// Cargar variables de entorno al principio
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Importar Nodemailer

const app = express();
const port = process.env.PORT || 3000;

// Middleware para habilitar CORS
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

// --- Configuración del transportador de Nodemailer ---
// Este objeto es el que Nodemailer usa para enviar emails.
// Aquí se configura para usar Gmail. Adapta esto según tu proveedor de email.
const transporter = nodemailer.createTransport({
    service: 'gmail', // Puedes cambiarlo por 'hotmail', 'outlook', o un host SMTP personalizado
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- Rutas de la API (Manteniendo las existentes y añadiendo la nueva) ---

// (Tus rutas existentes para /api/users, /api/login, etc. irían aquí)
// Por ejemplo, tu ruta GET /api/users:
app.get('/api/users', async (req, res) => {
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
                users AS u
            JOIN
                roles AS r ON u.role_id = r.id
        `);
        res.json({ users: rows });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// --- Nueva Ruta para el Formulario de Contacto ---
app.post('/api/contact', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { name, email, subject, message } = req.body;

        // 1. Validar datos del formulario
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Nombre, email y mensaje son campos requeridos.' });
        }

        // 2. Guardar datos en la base de datos (tabla `contacts`)
        const [result] = await connection.execute(
            'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject || null, message] // subject puede ser opcional
        );

        // 3. Enviar email de confirmación al usuario
        const mailOptions = {
            from: process.env.EMAIL_USER, // Tu email
            to: email, // El email del usuario que envió el formulario
            subject: '¡Gracias por contactarnos! - Confirmación de Recepción',
            html: `
                <p>Hola ${name},</p>
                <p>Hemos recibido tu mensaje y queremos agradecerte por contactarnos. Nuestro equipo se pondrá en contacto contigo a la brevedad posible.</p>
                <p>Aquí está un resumen de tu mensaje:</p>
                <ul>
                    <li><strong>Asunto:</strong> ${subject || 'Sin asunto'}</li>
                    <li><strong>Mensaje:</strong> <br>${message.replace(/\n/g, '<br>')}</li>
                </ul>
                <p>¡Esperamos hablar contigo pronto!</p>
                <p>Atentamente,</p>
                <p>El equipo de Hardman</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email de confirmación enviado a ${email}`);

        res.status(200).json({
            message: 'Formulario de contacto recibido y email de confirmación enviado exitosamente.',
            contactId: result.insertId
        });

    } catch (error) {
        console.error('Error al procesar el formulario de contacto:', error);
        res.status(500).json({
            message: 'Error interno del servidor al procesar el formulario de contacto.',
            error: error.message
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// --- Iniciar el Servidor ---
app.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
    console.log(`Para probar el formulario de contacto: POST http://localhost:${port}/api/contact`);
    // ... (otras rutas para tus ABM, si quieres mostrarlas en consola)
});