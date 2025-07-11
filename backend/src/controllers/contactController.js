const pool = require('../config/db');
const mailerTransporter = require('../config/mailer');

const submitContactForm = async (req, res) => {
    try {
        const { nombre_cliente, email_cliente, telefono, descripcion, id_usuario_rel, subject } = req.body;
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

        // --- PASO 1: Validaciones (esto no cambia) ---
        if (!nombre_cliente || !email_cliente || !descripcion) {
            return res.status(400).json({ message: 'Nombre, email y descripción son requeridos.' });
        }
        // ...resto de validaciones...

        let final_id_usuario_rel = null;
        if (id_usuario_rel) {
            // ...código para validar el usuario...
        }

        // --- PASO 2: Guardar en la Base de Datos ---
        const [result] = await pool.execute(
            'INSERT INTO formulario_contacto (nombre_cliente, email_cliente, telefono, descripcion, id_usuario_rel) VALUES (?, ?, ?, ?, ?)',
            [nombre_cliente, email_cliente, telefono || null, descripcion, final_id_usuario_rel]
        );
        const contactId = result.insertId;
        console.log(`Formulario guardado en la DB con ID: ${contactId}`);

        // --- PASO 3: Enviar los emails (ESTA LÓGICA QUEDA IDÉNTICA) ---
        // Se ejecuta justo después de que la base de datos confirma el guardado.

        // Enviar email de confirmación al usuario
        const mailOptionsToUser = {
            from: process.env.EMAIL_USER,
            to: email_cliente,
            subject: '¡Gracias por contactarnos! - Confirmación de Recepción de Hardman',
            html: `<p>Hola ${nombre_cliente}, hemos recibido tu mensaje...</p>` // Tu HTML aquí
        };
        await mailerTransporter.sendMail(mailOptionsToUser);
        console.log(`Email de confirmación de contacto enviado a ${email_cliente}`);

        // Enviar notificación por email al equipo administrativo
        if (ADMIN_EMAIL) {
            const mailOptionsToAdmin = {
                from: process.env.EMAIL_USER,
                to: ADMIN_EMAIL,
                subject: `Nuevo Formulario de Contacto de Hardman: ${subject || 'Sin Asunto'}`,
                html: `<p>Se ha recibido un nuevo formulario de contacto de ${nombre_cliente}...</p>` // Tu HTML aquí
            };
            await mailerTransporter.sendMail(mailOptionsToAdmin);
            console.log(`Notificación de nuevo contacto enviada al administrador: ${ADMIN_EMAIL}`);
        }

        // --- PASO 4: Responder al frontend ---
        res.status(200).json({
            message: 'Formulario de contacto recibido y email de confirmación enviado exitosamente.',
            contactId: contactId
        });

    } catch (error) {
        // Si hay un error en CUALQUIERA de los 'await' de arriba (DB o email), saltará aquí.
        console.error('Error al procesar el formulario de contacto:', error);
        res.status(500).json({
            message: 'Error interno del servidor al procesar el formulario.',
            error: error.message
        });
    }
};

module.exports = {
    submitContactForm
    // ...otras funciones que exportes
};