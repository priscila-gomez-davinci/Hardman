// src/controllers/contactController.js
// Importamos las funciones y objetos necesarios
const { getConnection } = require('../config/db'); // Importa getConnection desde tu nuevo archivo
const mailerTransporter = require('../config/mailer'); // Importa el transporter de Nodemailer

const submitContactForm = async (req, res) => {
    let connection;
    try {
        const { nombre_cliente, email_cliente, telefono, descripcion, id_usuario_rel, subject } = req.body;
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // Accedemos a variables de entorno aquí

        // 1. Validar datos del formulario
        if (!nombre_cliente || !email_cliente || !descripcion) {
            return res.status(400).json({ message: 'Nombre, email y descripción (mensaje) son campos requeridos.' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_cliente)) {
            return res.status(400).json({ message: 'Formato de email inválido.' });
        }

        // Si se proporciona id_usuario_rel, verificar que el usuario exista
        let final_id_usuario_rel = null;
        if (id_usuario_rel) {
            connection = await getConnection(); // Conectamos para validar el usuario
            const [userRows] = await connection.execute('SELECT id FROM users WHERE id = ?', [id_usuario_rel]);
            if (userRows.length > 0) {
                final_id_usuario_rel = id_usuario_rel;
            } else {
                console.warn(`id_usuario_rel ${id_usuario_rel} no encontrado para formulario de contacto, se guardará como NULL.`);
            }
            // No cerramos la conexión aquí, se cerrará en el finally del controlador principal.
        }

        // Si la conexión no se ha abierto aún (porque no hubo id_usuario_rel), la abrimos ahora.
        if (!connection) {
            connection = await getConnection();
        }

        // 2. Guardar datos en la base de datos (tabla `formulario_contacto`)
        const [result] = await connection.execute(
            'INSERT INTO formulario_contacto (nombre_cliente, email_cliente, telefono, descripcion, id_usuario_rel) VALUES (?, ?, ?, ?, ?)',
            [nombre_cliente, email_cliente, telefono || null, descripcion, final_id_usuario_rel]
        );
        const contactId = result.insertId;

        // 3. Enviar email de confirmación al usuario
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
        await mailerTransporter.sendMail(mailOptionsToUser);
        console.log(`Email de confirmación de contacto enviado a ${email_cliente}`);

        // 4. Enviar notificación por email al equipo administrativo
        if (ADMIN_EMAIL) {
            const mailOptionsToAdmin = {
                from: process.env.EMAIL_USER,
                to: ADMIN_EMAIL,
                subject: `Nuevo Formulario de Contacto de Hardman: ${subject || 'Sin Asunto'}`,
                html: `
                    <p>Se ha recibido un nuevo formulario de contacto:</p>
                    <ul>
                        <li><strong>Nombre:</strong> ${nombre_cliente}</li>
                        <li><strong>Email:</strong> ${email_cliente}</li>
                        ${telefono ? `<li><strong>Teléfono:</strong> ${telefono}</li>` : ''}
                        ${subject ? `<li><strong>Asunto:</strong> ${subject}</li>` : '<li><strong>Asunto:</strong> Sin asunto especificado</li>'}
                        <li><strong>Mensaje:</strong> <br>${descripcion.replace(/\n/g, '<br>')}</li>
                        ${final_id_usuario_rel ? `<li><strong>ID de Usuario Relacionado:</strong> ${final_id_usuario_rel}</li>` : ''}
                        <li><strong>ID del Contacto en DB:</strong> ${contactId}</li>
                    </ul>
                    <p>Por favor, revisa y responde lo antes posible.</p>
                `
            };
            await mailerTransporter.sendMail(mailOptionsToAdmin);
            console.log(`Notificación de nuevo contacto enviada al administrador: ${ADMIN_EMAIL}`);
        }

        res.status(200).json({
            message: 'Formulario de contacto recibido y email de confirmación enviado exitosamente.',
            contactId: contactId
        });

    } catch (error) {
        console.error('Error al procesar el formulario de contacto:', error);
        if (connection) {
            // Si la conexión se abrió con éxito y luego hubo un error, ciérrala.
            // Para transacciones más complejas, necesitarías connection.rollback();
            await connection.end();
        }
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
        if (connection && connection.end) { // Asegurarse de que connection existe y tiene el método end
            await connection.end();
        }
    }
};

// Si tuvieras otras operaciones para contacto (ej. GET todos los contactos para un admin)
const getAllContacts = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM formulario_contacto');
        res.json({ contacts: rows });
    } catch (error) {
        console.error('Error al obtener todos los contactos:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};


module.exports = {
    submitContactForm,
    getAllContacts // Si creas esta función, exporta también
};