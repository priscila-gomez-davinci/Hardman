require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const nodemailer = require('nodemailer'); 
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

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

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});


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


app.post('/api/contact', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { nombre_cliente, email_cliente, telefono, descripcion, id_usuario_rel } = req.body;
        const { subject } = req.body;


        // 1. Validar datos del formulario
        if (!nombre_cliente || !email_cliente || !descripcion) {
            return res.status(400).json({ message: 'Nombre, email y descripción (mensaje) son campos requeridos.' });
        }

        // Validación adicional para email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_cliente)) {
            return res.status(400).json({ message: 'Formato de email inválido.' });
        }

        if (id_usuario_rel) {
            const [userRows] = await connection.execute('SELECT id FROM users WHERE id = ?', [id_usuario_rel]);
            if (userRows.length === 0) {
                console.warn(`id_usuario_rel ${id_usuario_rel} no encontrado, se guardará como NULL.`);
            }
        }


        // 2. Guardar datos en la base de datos (tabla `formulario_contacto`)
        const [result] = await connection.execute(
            'INSERT INTO formulario_contacto (nombre_cliente, email_cliente, telefono, descripcion, id_usuario_rel) VALUES (?, ?, ?, ?, ?)',
            [nombre_cliente, email_cliente, telefono || null, descripcion, id_usuario_rel || null] // telefono e id_usuario_rel pueden ser null
        );

        const contactId = result.insertId;

        // 3. Enviar email de confirmación al usuario (el que envió el formulario)
        const mailOptionsToUser = {
            from: process.env.EMAIL_USER, 
            to: email_cliente,
            subject: '¡Gracias por contactarnos! - Confirmación de Recepción de Hardman',
            html: `
                <p>Hola ${nombre_cliente},</p>
                <p>Hemos recibido tu mensaje y queremos agradecerte por contactarnos. Nuestro equipo se pondrá en contacto contigo a la brevedad posible.</p>
                <p>Aquí está un resumen de tu mensaje:</p>
                <ul>
                    <li><strong>Email:</strong> ${email_cliente}</li>
                    ${telefono ? `<li><strong>Teléfono:</strong> ${telefono}</li>` : ''}
                    ${subject ? `<li><strong>Asunto:</strong> ${subject}</li>` : '<li><strong>Asunto:</strong> Sin asunto especificado</li>'}
                    <li><strong>Mensaje:</strong> <br>${descripcion.replace(/\n/g, '<br>')}</li>
                </ul>
                <p>¡Esperamos hablar contigo pronto!</p>
                <p>Atentamente,</p>
                <p>El equipo de Hardman</p>
            `
        };

        // 4.  Enviar una notificación por email al equipo administrativo
        const mailOptionsToAdmin = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL, 
            subject: `Nuevo Formulario de Contacto de Hardman: ${subject || 'Sin Asunto'}`,
            html: `
                <p>Se ha recibido un nuevo formulario de contacto:</p>
                <ul>
                    <li><strong>Nombre:</strong> ${nombre_cliente}</li>
                    <li><strong>Email:</strong> ${email_cliente}</li>
                    ${telefono ? `<li><strong>Teléfono:</strong> ${telefono}</li>` : ''}
                    ${subject ? `<li><strong>Asunto:</strong> ${subject}</li>` : '<li><strong>Asunto:</strong> Sin asunto especificado</li>'}
                    <li><strong>Mensaje:</strong> <br>${descripcion.replace(/\n/g, '<br>')}</li>
                    ${id_usuario_rel ? `<li><strong>ID de Usuario Relacionado:</strong> ${id_usuario_rel}</li>` : ''}
                    <li><strong>ID del Contacto en DB:</strong> ${contactId}</li>
                </ul>
                <p>Por favor, revisa y responde lo antes posible.</p>
            `
        };


        await transporter.sendMail(mailOptionsToUser);
        console.log(`Email de confirmación enviado a ${email_cliente}`);

        if (process.env.ADMIN_EMAIL) {
            await transporter.sendMail(mailOptionsToAdmin);
            console.log(`Notificación de nuevo contacto enviada al administrador: ${process.env.ADMIN_EMAIL}`);
        }


        res.status(200).json({
            message: 'Formulario de contacto recibido y email de confirmación enviado exitosamente.',
            contactId: contactId
        });

    } catch (error) {
        console.error('Error al procesar el formulario de contacto:', error);
        if (error.code === 'EENVELOPE' || error.code === 'EAUTH') { 
            return res.status(500).json({
                message: 'Error al enviar el email. Verifique la configuración del servidor de correo.',
                error: error.message
            });
        }
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

app.get('/', (req, res) => {
    res.send('API de HARDMAN funcionando!');
});

app.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
    console.log(`Para probar el formulario de contacto: POST http://localhost:${port}/api/contact`);
});