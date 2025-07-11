// Cargar variables de entorno al principio
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise'); // Usamos la versión con promesas para async/await
const cors = require('cors'); // Para habilitar CORS
const nodemailer = require('nodemailer'); // Importar Nodemailer
// const bcrypt = require('bcrypt'); // Descomentar si implementas hashing de contraseñas
// const jwt = require('jsonwebtoken'); // Descomentar si implementas JWT
// const { verifyToken, isAdmin } = require('./middlewares/authMiddleware'); // Descomentar y crear este archivo si implementas autenticación/autorización

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
// ASEGÚRATE de usar una "Contraseña de Aplicación" de Google en lugar de la contraseña de tu cuenta principal.
// Google está eliminando el soporte para "Acceso de apps menos seguras".
const transporter = nodemailer.createTransport({
    service: 'gmail', // Puedes cambiarlo por 'hotmail', 'outlook', o un host SMTP personalizado
    auth: {
        user: process.env.EMAIL_USER, // Tu email (ej. mi.email@gmail.com)
        pass: process.env.EMAIL_PASS  // Tu Contraseña de Aplicación de Google
    }
});

// --- ID de Categoría para "Armado de PC" ---
// Asegúrate de que este ID sea el correcto de tu tabla `categoria_reparacion`
// Si no existe, puedes insertarlo manualmente en tu DB (ej. INSERT INTO categoria_reparacion (nombre_categoria) VALUES ('Armado de PC');)
const ID_CATEGORIA_ARMADO_PC = parseInt(process.env.ID_CATEGORIA_ARMADO_PC || '4'); // Por defecto, usa 4 si no está en .env


// --- RUTAS DE LA API ---

// --- RUTAS DE USUARIOS (EXISTENTES Y MEJORAS RECOMENDADAS) ---
// Ruta para obtener todos los usuarios
app.get('/api/users', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT
                u.id,
                u.name,
                u.email,
                -- u.password, -- NO INCLUIR LA CONTRASEÑA EN RESPUESTAS GET EN PRODUCCIÓN
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

// Agrega aquí tus rutas POST, PUT, DELETE para usuarios, y la ruta POST /api/login
// Asegúrate de aplicar las recomendaciones de bcrypt y JWT para estas rutas.


// --- RUTAS DE FORMULARIO DE CONTACTO (CORREGIDAS) ---
app.post('/api/contact', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        // Los campos esperados del frontend son 'nombre_cliente', 'email_cliente', 'telefono', 'descripcion', 'id_usuario_rel'
        // El campo 'subject' es opcional y solo para el email, no se guarda en la DB directamente.
        const { nombre_cliente, email_cliente, telefono, descripcion, id_usuario_rel, subject } = req.body;


        // 1. Validar datos del formulario
        if (!nombre_cliente || !email_cliente || !descripcion) {
            return res.status(400).json({ message: 'Nombre, email y descripción (mensaje) son campos requeridos.' });
        }

        // Validación adicional para email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_cliente)) {
            return res.status(400).json({ message: 'Formato de email inválido.' });
        }

        // Si se proporciona id_usuario_rel, verificar que el usuario exista
        let final_id_usuario_rel = null;
        if (id_usuario_rel) {
            const [userRows] = await connection.execute('SELECT id FROM users WHERE id = ?', [id_usuario_rel]);
            if (userRows.length > 0) {
                final_id_usuario_rel = id_usuario_rel;
            } else {
                console.warn(`id_usuario_rel ${id_usuario_rel} no encontrado para formulario de contacto, se guardará como NULL.`);
            }
        }


        // 2. Guardar datos en la base de datos (tabla `formulario_contacto`)
        const [result] = await connection.execute(
            'INSERT INTO formulario_contacto (nombre_cliente, email_cliente, telefono, descripcion, id_usuario_rel) VALUES (?, ?, ?, ?, ?)',
            [nombre_cliente, email_cliente, telefono || null, descripcion, final_id_usuario_rel] // telefono e id_usuario_rel pueden ser null
        );

        const contactId = result.insertId;

        // 3. Enviar email de confirmación al usuario (el que envió el formulario)
        const mailOptionsToUser = {
            from: process.env.EMAIL_USER, // Tu email configurado en .env
            to: email_cliente, // El email del usuario que envió el formulario
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

        await transporter.sendMail(mailOptionsToUser);
        console.log(`Email de confirmación de contacto enviado a ${email_cliente}`);

        // 4. (OPCIONAL) Enviar una notificación por email al equipo administrativo
        if (process.env.ADMIN_EMAIL) {
            const mailOptionsToAdmin = {
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL, // Un email administrativo donde quieres recibir las notificaciones
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
            await transporter.sendMail(mailOptionsToAdmin);
            console.log(`Notificación de nuevo contacto enviada al administrador: ${process.env.ADMIN_EMAIL}`);
        }


        res.status(200).json({
            message: 'Formulario de contacto recibido y email de confirmación enviado exitosamente.',
            contactId: contactId
        });

    } catch (error) {
        console.error('Error al procesar el formulario de contacto:', error);
        // Si el error es específicamente de Nodemailer, podrías querer manejarlo de forma diferente
        if (error.code === 'EENVELOPE' || error.code === 'EAUTH') { // Error en la configuración del email
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


// --- RUTAS DE PRODUCTOS PARA ARMADO DE PC ---

// Consulta de Productos para Armado de PC
// Esta ruta es para que el frontend obtenga los componentes que el usuario puede elegir.
// Requiere autenticación/autorización si solo usuarios registrados/logueados pueden solicitar armados.
app.get('/api/productos/para-armado', /* (middlewares aquí, ej. verifyToken) */ async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT
                p.id_producto,
                p.nombre_producto,
                p.descripcion,
                p.precio_minorista,
                p.stock,
                p.imagen_url,
                p.sku,
                c.nombre_categoria
            FROM
                producto AS p
            JOIN
                categoria AS c ON p.id_categoria = c.id_categoria
            WHERE
                p.activo = 1 AND p.stock > 0
                -- Puedes añadir un filtro por categoría específica si tienes categorías de componentes (ej. 'Procesadores', 'Tarjetas Gráficas')
                -- AND c.nombre_categoria IN ('Procesadores', 'Tarjetas Gráficas', 'Memorias RAM', 'Almacenamiento', 'Placas Base', 'Fuentes de Poder', 'Gabinetes')
            ORDER BY p.nombre_producto
        `);
        res.json({ productos: rows });
    } catch (error) {
        console.error('Error al obtener productos para armado:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

// Envío de Pedido de Armado de PC
// Esta ruta es donde el usuario envía su selección de componentes para un nuevo pedido de armado.
// Requiere autenticación/autorización si solo usuarios registrados/logueados pueden solicitar armados.
app.post('/api/armado-pc', /* (middlewares aquí, ej. verifyToken) */ async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        await connection.beginTransaction(); // Iniciar transacción para asegurar coherencia

        const {
            nombre_cliente,
            email_cliente,
            telefono_cliente,
            productos_seleccionados, // Array de { id_producto, cantidad }
            notas_adicionales,
            id_usuario_cliente // Opcional, si el usuario está logueado (puede venir del JWT)
        } = req.body;

        // 1. Validar datos básicos
        if (!nombre_cliente || !email_cliente || !productos_seleccionados || productos_seleccionados.length === 0) {
            return res.status(400).json({ message: 'Nombre, email y al menos un producto seleccionado son requeridos.' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_cliente)) {
            return res.status(400).json({ message: 'Formato de email inválido.' });
        }

        // 2. Validar productos seleccionados y calcular un "costo estimado"
        let costo_estimado = 0;
        let descripcion_productos_html = "<h4>Componentes seleccionados:</h4><ul>";
        let productsToUpdateStock = [];

        for (const item of productos_seleccionados) {
            if (!item.id_producto || !item.cantidad || item.cantidad <= 0) {
                await connection.rollback();
                return res.status(400).json({ message: 'Cada producto seleccionado debe tener id_producto y una cantidad válida y mayor a 0.' });
            }

            const [productRows] = await connection.execute(
                'SELECT nombre_producto, precio_minorista, stock, activo FROM producto WHERE id_producto = ?',
                [item.id_producto]
            );

            const product = productRows[0];

            if (!product || product.activo === 0) {
                await connection.rollback();
                return res.status(400).json({ message: `Producto con ID ${item.id_producto} no encontrado o inactivo.` });
            }
            if (product.stock < item.cantidad) {
                await connection.rollback();
                return res.status(400).json({ message: `Stock insuficiente para ${product.nombre_producto}. Stock disponible: ${product.stock}` });
            }

            const subtotal_producto = parseFloat((product.precio_minorista * item.cantidad).toFixed(2));
            costo_estimado += subtotal_producto;
            descripcion_productos_html += `<li>${product.nombre_producto} (x${item.cantidad}) - $${product.precio_minorista.toFixed(2)} c/u - Subtotal: $${subtotal_producto.toFixed(2)}</li>`;
            productsToUpdateStock.push({ id_producto: item.id_producto, cantidad: item.cantidad });
        }
        descripcion_productos_html += "</ul>";
        descripcion_productos_html += `<p><strong>Notas adicionales:</strong> ${notas_adicionales || 'Ninguna.'}</p>`;


        // 3. Validar id_usuario_cliente si se proporciona
        let final_id_usuario_cliente = null;
        if (id_usuario_cliente) {
            const [userClientRows] = await connection.execute('SELECT id FROM users WHERE id = ?', [id_usuario_cliente]);
            if (userClientRows.length > 0) {
                final_id_usuario_cliente = id_usuario_cliente;
            } else {
                console.warn(`id_usuario_cliente ${id_usuario_cliente} no encontrado para pedido de armado, se guardará como NULL.`);
            }
        }

        // 4. Insertar en la tabla `pedido_reparacion`
        const [result] = await connection.execute(
            `INSERT INTO pedido_reparacion (nombre_cliente, email_cliente, telefono_cliente, descripcion, fecha_solicitud, estado_reparacion, id_usuario_cliente, id_usuario_tecnico, id_categoria_reparacion)
             VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
            [
                nombre_cliente,
                email_cliente,
                telefono_cliente || null,
                descripcion_productos_html, // Guardamos la descripción HTML de los productos + notas
                'solicitado', // Estado inicial del pedido de armado
                final_id_usuario_cliente,
                null, // id_usuario_tecnico es null al principio
                ID_CATEGORIA_ARMADO_PC
            ]
        );
        const newPedidoArmadoId = result.insertId;

        // 5. Actualizar el stock de los productos
        for (const item of productsToUpdateStock) {
            await connection.execute(
                'UPDATE producto SET stock = stock - ? WHERE id_producto = ?',
                [item.cantidad, item.id_producto]
            );
        }

        await connection.commit(); // Confirmar transacción

        // 6. Enviar emails de confirmación/notificación
        // Email al cliente
        const mailOptionsToUser = {
            from: process.env.EMAIL_USER,
            to: email_cliente,
            subject: 'Confirmación de tu Pedido de Armado de PC - Hardman',
            html: `
                <p>Hola ${nombre_cliente},</p>
                <p>Hemos recibido tu solicitud de armado de PC (ID de Pedido: <strong>${newPedidoArmadoId}</strong>).</p>
                <p>Tu pedido está actualmente en estado "solicitado". Un técnico lo revisará pronto y te contactaremos para confirmar los detalles y el precio final.</p>
                ${descripcion_productos_html}
                <p><strong>Costo Estimado de Componentes:</strong> $${costo_estimado.toFixed(2)}</p>
                <p>¡Gracias por elegirnos!</p>
                <p>Atentamente,</p>
                <p>El equipo de Hardman</p>
            `
        };

        await transporter.sendMail(mailOptionsToUser);
        console.log(`Email de confirmación de pedido de armado enviado a ${email_cliente}`);

        // Notificación al administrador
        if (process.env.ADMIN_EMAIL) {
            const mailOptionsToAdmin = {
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL,
                subject: `Nuevo Pedido de Armado de PC (ID: ${newPedidoArmadoId}) de ${nombre_cliente}`,
                html: `
                    <p>Se ha recibido un nuevo pedido de armado de PC:</p>
                    <ul>
                        <li><strong>ID Pedido:</strong> ${newPedidoArmadoId}</li>
                        <li><strong>Cliente:</strong> ${nombre_cliente} (${email_cliente})</li>
                        <li><strong>Teléfono:</strong> ${telefono_cliente || 'N/A'}</li>
                        <li><strong>Costo Estimado Componentes:</strong> $${costo_estimado.toFixed(2)}</li>
                        <li><strong>Descripción de Componentes:</strong> <br>${descripcion_productos_html}</li>
                        ${final_id_usuario_cliente ? `<li><strong>ID de Usuario Cliente:</strong> ${final_id_usuario_cliente}</li>` : ''}
                    </ul>
                    <p>Por favor, revisa y asigna un técnico.</p>
                `
            };
            await transporter.sendMail(mailOptionsToAdmin);
            console.log(`Notificación de nuevo pedido de armado enviada al administrador: ${process.env.ADMIN_EMAIL}`);
        }

        res.status(201).json({
            message: 'Pedido de armado de PC recibido exitosamente. Te hemos enviado un email de confirmación.',
            id_pedido_armado: newPedidoArmadoId,
            costo_estimado: costo_estimado
        });

    } catch (error) {
        console.error('Error al procesar el pedido de armado:', error);
        if (connection) {
            await connection.rollback(); // Revertir transacción en caso de error
            console.warn('Transacción de pedido de armado revertida.');
        }
        // Manejo de errores específicos de Nodemailer o DB
        if (error.code === 'EENVELOPE' || error.code === 'EAUTH') {
            return res.status(500).json({
                message: 'Error al enviar el email de confirmación. El pedido se registró, pero revisa la configuración de correo.',
                error: error.message
            });
        }
        res.status(500).json({
            message: 'Error interno del servidor al procesar el pedido de armado.',
            error: error.message
        });
    } finally {
        if (connection) await connection.end();
    }
});


// Rutas para consultar Pedidos de Armado (filtrados por categoría y opcionalmente por técnico/estado)
// Estas rutas deben ser accedidas por administradores o técnicos.
app.get('/api/armado-pc', /* (middlewares aquí, ej. verifyToken, isAdminOrTechnician) */ async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        const { estado, tecnico_id } = req.query; // Filtros opcionales

        let query = `
            SELECT
                pr.id_pedido_reparacion,
                pr.nombre_cliente,
                pr.email_cliente,
                pr.telefono_cliente,
                pr.descripcion,
                pr.fecha_solicitud,
                pr.estado_reparacion,
                pr.id_usuario_cliente,
                uc.name AS nombre_usuario_cliente,
                pr.id_usuario_tecnico,
                ut.name AS nombre_usuario_tecnico,
                cr.nombre_categoria AS nombre_categoria_reparacion
            FROM
                pedido_reparacion AS pr
            LEFT JOIN
                users AS uc ON pr.id_usuario_cliente = uc.id
            LEFT JOIN
                users AS ut ON pr.id_usuario_tecnico = ut.id
            JOIN
                categoria_reparacion AS cr ON pr.id_categoria_reparacion = cr.id_categoria_reparacion
            WHERE
                pr.id_categoria_reparacion = ?
        `;
        let params = [ID_CATEGORIA_ARMADO_PC];

        if (estado) {
            query += ' AND pr.estado_reparacion = ?';
            params.push(estado);
        }
        if (tecnico_id) {
            query += ' AND pr.id_usuario_tecnico = ?';
            params.push(tecnico_id);
        }

        query += ' ORDER BY pr.fecha_solicitud DESC';

        const [rows] = await connection.execute(query, params);
        res.json({ pedidosArmado: rows });
    } catch (error) {
        console.error('Error al obtener pedidos de armado de PC:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

// Ruta para obtener un pedido de armado de PC por ID
// Debe ser accesible por administradores, técnicos asignados o el propio cliente (si se verifica el id_usuario_cliente)
app.get('/api/armado-pc/:id', /* (middlewares aquí, ej. verifyToken, checkPedidoAccess) */ async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;

        const ID_CATEGORIA_ARMADO_PC = parseInt(process.env.ID_CATEGORIA_ARMADO_PC || '4');

        const [rows] = await connection.execute(`
            SELECT
                pr.id_pedido_reparacion,
                pr.nombre_cliente,
                pr.email_cliente,
                pr.telefono_cliente,
                pr.descripcion,
                pr.fecha_solicitud,
                pr.estado_reparacion,
                pr.id_usuario_cliente,
                uc.name AS nombre_usuario_cliente,
                pr.id_usuario_tecnico,
                ut.name AS nombre_usuario_tecnico,
                cr.nombre_categoria AS nombre_categoria_reparacion
            FROM
                pedido_reparacion AS pr
            LEFT JOIN
                users AS uc ON pr.id_usuario_cliente = uc.id
            LEFT JOIN
                users AS ut ON pr.id_usuario_tecnico = ut.id
            JOIN
                categoria_reparacion AS cr ON pr.id_categoria_reparacion = cr.id_categoria_reparacion
            WHERE
                pr.id_pedido_reparacion = ? AND pr.id_categoria_reparacion = ?
        `, [id, ID_CATEGORIA_ARMADO_PC]);

        const pedidoArmado = rows[0];
        if (!pedidoArmado) {
            return res.status(404).json({ message: 'Pedido de armado de PC no encontrado.' });
        }
        res.json({ pedidoArmado: pedidoArmado });
    } catch (error) {
        console.error('Error al obtener pedido de armado de PC por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});


// Ruta para actualizar un pedido de armado de PC (incluyendo asignación de técnico y cambio de estado)
// Esta ruta debe ser accedida por administradores o técnicos (para sus pedidos asignados).
app.put('/api/armado-pc/:id', /* (middlewares aquí, ej. verifyToken, isAdminOrAssignedTechnician) */ async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const {
            nombre_cliente,
            email_cliente,
            telefono_cliente,
            descripcion, // Se espera la descripción completa, incluyendo los productos y notas
            estado_reparacion,
            id_usuario_cliente,
            id_usuario_tecnico, // Campo para asignar o cambiar el técnico
            id_categoria_reparacion // Debería ser el ID de "Armado de PC"
        } = req.body;

        const ID_CATEGORIA_ARMADO_PC = parseInt(process.env.ID_CATEGORIA_ARMADO_PC || '4');

        // Validación básica de campos requeridos (adapta si se permiten actualizaciones parciales)
        if (!nombre_cliente || !email_cliente || !descripcion || !estado_reparacion || !id_categoria_reparacion) {
            return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar el pedido de armado.' });
        }
        if (id_categoria_reparacion !== ID_CATEGORIA_ARMADO_PC) {
             return res.status(400).json({ message: 'La categoría de reparación debe ser "Armado de PC" para esta ruta.' });
        }

        // Validar id_usuario_cliente si se proporciona
        let final_id_usuario_cliente = null;
        if (id_usuario_cliente) {
            const [userClientRows] = await connection.execute('SELECT id FROM users WHERE id = ?', [id_usuario_cliente]);
            if (userClientRows.length > 0) {
                final_id_usuario_cliente = id_usuario_cliente;
            } else {
                console.warn(`id_usuario_cliente ${id_usuario_cliente} no encontrado, se guardará como NULL.`);
            }
        }

        // Validación y manejo para id_usuario_tecnico
        let final_id_usuario_tecnico = null;
        if (id_usuario_tecnico) {
            // Asegurarse de que el usuario asignado exista y tenga el rol de técnico (ej. role_id = 3)
            const [userTechRows] = await connection.execute('SELECT id, role_id FROM users WHERE id = ?', [id_usuario_tecnico]);
            if (userTechRows.length === 0 || userTechRows[0].role_id !== 3) { // Asumiendo role_id 3 para técnicos
                return res.status(400).json({ message: 'El usuario técnico especificado no existe o no tiene el rol de técnico.' });
            }
            final_id_usuario_tecnico = id_usuario_tecnico;
        }

        const [result] = await connection.execute(
            `UPDATE pedido_reparacion SET
                nombre_cliente = ?,
                email_cliente = ?,
                telefono_cliente = ?,
                descripcion = ?,
                estado_reparacion = ?,
                id_usuario_cliente = ?,
                id_usuario_tecnico = ?,
                id_categoria_reparacion = ?
             WHERE id_pedido_reparacion = ? AND id_categoria_reparacion = ?`, // Aseguramos que sea un pedido de armado
            [
                nombre_cliente,
                email_cliente,
                telefono_cliente || null,
                descripcion,
                estado_reparacion,
                final_id_usuario_cliente,
                final_id_usuario_tecnico,
                ID_CATEGORIA_ARMADO_PC,
                id,
                ID_CATEGORIA_ARMADO_PC // Condición doble para mayor seguridad
            ]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido de armado de PC no encontrado o no se realizaron cambios.' });
        }

        // OPCIONAL: Enviar email al técnico asignado o al cliente si el estado cambia
        // (Similar a la lógica en el ejemplo anterior)
        if (final_id_usuario_tecnico) {
            const [assignedTech] = await connection.execute('SELECT email, name FROM users WHERE id = ?', [final_id_usuario_tecnico]);
            if (assignedTech.length > 0) {
                const techEmail = assignedTech[0].email;
                const techName = assignedTech[0].name;

                const mailOptionsToTech = {
                    from: process.env.EMAIL_USER,
                    to: techEmail,
                    subject: `Actualización de Pedido de Armado/Reparación (ID: ${id})`,
                    html: `
                        <p>Hola ${techName},</p>
                        <p>El pedido <strong>ID ${id}</strong> ha sido actualizado.</p>
                        <ul>
                            <li><strong>Cliente:</strong> ${nombre_cliente} (${email_cliente})</li>
                            <li><strong>Estado Actual:</strong> ${estado_reparacion}</li>
                            <li><strong>Descripción del Pedido:</strong> <br>${descripcion.replace(/\n/g, '<br>')}</li>
                        </ul>
                        <p>¡Gracias!</p>
                    `
                };
                await transporter.sendMail(mailOptionsToTech);
                console.log(`Email de actualización de pedido enviado a técnico ${techEmail}`);
            }
        }
        // También puedes enviar una notificación al cliente si el estado de su pedido de armado cambia
        const mailOptionsToClientUpdate = {
             from: process.env.EMAIL_USER,
             to: email_cliente,
             subject: `Actualización de tu Pedido de Armado de PC (ID: ${id}) - Hardman`,
             html: `
                 <p>Hola ${nombre_cliente},</p>
                 <p>Queremos informarte que el estado de tu pedido de armado de PC (ID: <strong>${id}</strong>) ha sido actualizado a: <strong>${estado_reparacion}</strong>.</p>
                 <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                 <p>Atentamente,</p>
                 <p>El equipo de Hardman</p>
             `
         };
         await transporter.sendMail(mailOptionsToClientUpdate);
         console.log(`Email de actualización de estado enviado a cliente ${email_cliente}`);


        res.json({ message: 'Pedido de armado de PC actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar pedido de armado de PC:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar pedido de armado de PC', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

// Ruta para eliminar un pedido de armado de PC
// Esta ruta DEBE ser accedida solo por administradores y con MUCHO CUIDADO (restaurar stock).
app.delete('/api/armado-pc/:id', /* (middlewares aquí, ej. verifyToken, isAdmin) */ async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        await connection.beginTransaction();

        const { id } = req.params;
        const ID_CATEGORIA_ARMADO_PC = parseInt(process.env.ID_CATEGORIA_ARMADO_PC || '4');

        // 1. Obtener los detalles del pedido de armado para restaurar el stock
        // Aquí necesitamos parsear la 'descripcion' si guardamos los productos como texto/HTML.
        // Si hubiéramos creado una tabla intermedia (ej. pedido_armado_productos), sería más fácil.
        // Para simplificar, si se elimina un pedido de armado, por ahora NO RESTAURAREMOS EL STOCK AUTOMÁTICAMENTE
        // ya que los productos están incrustados en la descripción.
        // En un sistema real, una eliminación de pedido de armado podría implicar una revisión manual del stock o
        // una estructura de datos más robusta para los componentes del armado.
        console.warn(`ATENCIÓN: La eliminación del pedido de armado ${id} no restaura automáticamente el stock de productos, ya que los componentes están en la descripción.`);

        // 2. Eliminar el pedido de reparación/armado
        const [result] = await connection.execute(
            'DELETE FROM pedido_reparacion WHERE id_pedido_reparacion = ? AND id_categoria_reparacion = ?',
            [id, ID_CATEGORIA_ARMADO_PC]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Pedido de armado de PC no encontrado.' });
        }

        await connection.commit();
        res.json({ message: 'Pedido de armado de PC eliminado exitosamente. El stock de productos no fue restaurado automáticamente.' });

    } catch (error) {
        console.error('Error al eliminar pedido de armado de PC:', error);
        if (connection) {
            await connection.rollback();
            console.warn('Transacción de eliminación de pedido de armado revertida.');
        }
        res.status(500).json({ message: 'Error interno del servidor al eliminar pedido de armado de PC', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});


// --- Iniciar el Servidor ---
app.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
    console.log(`
    Rutas Disponibles:
    --------------------------------------------------------------------------------------
    - Usuarios:
      GET /api/users                                 : Obtener todos los usuarios.
      POST /api/login                                : Login de usuario (si implementado).
      POST /api/users                                : Crear nuevo usuario (Alta).
      PUT /api/users/:id                             : Actualizar usuario (Modificación).
      DELETE /api/users/:id                          : Eliminar usuario (Baja).

    - Contacto:
      POST /api/contact                              : Enviar formulario de contacto (guarda en DB y envía emails).

    - Armado de PC:
      GET /api/productos/para-armado                 : Obtener lista de productos disponibles para armado.
      POST /api/armado-pc                            : Solicitar un nuevo armado de PC (crea un pedido de reparación).
      GET /api/armado-pc                             : Obtener todos los pedidos de armado de PC (puede filtrar por estado/técnico).
      GET /api/armado-pc/:id                         : Obtener detalles de un pedido de armado de PC.
      PUT /api/armado-pc/:id                         : Actualizar un pedido de armado de PC (incluye asignación de técnico/estado).
      DELETE /api/armado-pc/:id                      : Eliminar un pedido de armado de PC (solo admin, stock no se restaura automáticamente).

    - Pedidos Generales (si ya los tienes):
      GET /api/pedidos                               : Obtener todos los pedidos.
      POST /api/pedidos                              : Crear un nuevo pedido (con detalles y stock).
      PUT /api/pedidos/:id/estado                    : Actualizar estado de pedido.
      DELETE /api/pedidos/:id                        : Eliminar pedido (con stock).

    - Reparaciones Generales (si ya los tienes):
      GET /api/pedidos-reparacion                    : Obtener todos los pedidos de reparación.
      POST /api/pedidos-reparacion                   : Crear un nuevo pedido de reparación.
      PUT /api/pedidos-reparacion/:id                : Actualizar un pedido de reparación.
      DELETE /api/pedidos-reparacion/:id             : Eliminar un pedido de reparación.
    --------------------------------------------------------------------------------------
    `);
});