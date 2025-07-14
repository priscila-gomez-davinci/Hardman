import pool from '../config/db.js'; 

// Controlador para manejar el envío del formulario de contacto
export const submitContactForm = async (req, res) => {
    const { name, email, phone, message } = req.body;

    if (!email || !message) {
        console.error('El mail es', email);

        console.error('El mensaje es ', message);

        return res.status(400).json({ 
            success: false, 
            message: 'Email y mensaje son campos obligatorios.' 

        });
    }

    try {
        const sqlQuery = 'INSERT INTO formulario_contacto (nombre_cliente, email_cliente, telefono, descripcion) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(sqlQuery, [name, email, phone, message]);

        console.log('Formulario de contacto guardado en la BD. ID:', result.insertId);

        res.status(201).json({ 
            success: true, 
            message: '¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.',
            contactId: result.insertId 
        });

    } catch (error) {
        console.error('Error al guardar el formulario de contacto en la BD:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor al procesar tu solicitud.' 
        });
    }
};