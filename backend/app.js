// app.js (el nuevo archivo principal en la raíz de backend)
// Cargar variables de entorno al principio (siempre la primera línea ejecutable)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
// Descomentar estas líneas si has instalado y vas a usar bcrypt y jsonwebtoken para autenticación.
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// --- Importar Módulos de Configuración ---
// Asegúrate de que las rutas a estos archivos sean correctas
const { getConnection } = require('./src/config/db'); // Importa la función de conexión de la DB
const mailerTransporter = require('./src/config/mailer'); // Importa el transporter de Nodemailer

// --- Importar Módulos de Rutas (Routers) ---
// Aquí es CRÍTICO que la importación sea directa, sin desestructuración {}
const contactRoutes = require('./src/routes/contactRoutes'); // Rutas para el formulario de contacto

// Aquí irían las importaciones de tus otros módulos de rutas a medida que los crees:
// const userRoutes = require('./src/routes/userRoutes');
// const productRoutes = require('./src/routes/productRoutes');
// const pedidoRoutes = require('./src/routes/pedidoRoutes');
// const pedidoReparacionRoutes = require('./src/routes/pedidoReparacionRoutes');
// const armadoPcRoutes = require('./src/routes/armadoPcRoutes'); // Para las rutas específicas de armado de PC

const app = express();
const port = process.env.PORT || 3000;

// --- Middlewares Globales de Express ---
// Estos middlewares se aplican a todas las peticiones entrantes
app.use(cors()); // Habilita CORS para permitir peticiones desde tu frontend
app.use(express.json()); // Parsea el cuerpo de las peticiones a formato JSON

// --- Prueba de Conexión Inicial a la Base de Datos ---
// Esta función se ejecuta una vez al iniciar el servidor para verificar la conexión a la DB.
async function testDbConnection() {
    let connection;
    try {
        connection = await getConnection(); // Intenta obtener una conexión
        console.log('✔ Conexión inicial a la base de datos MySQL exitosa.');
    } catch (error) {
        console.error('✖ Fallo al realizar conexión inicial a la base de datos:', error.message);
        console.error('Por favor, revisa tus configuraciones en el archivo .env y asegúrate de que MySQL esté corriendo.');
        process.exit(1); // Sale de la aplicación con un error si la DB no puede conectar al inicio
    } finally {
        if (connection) {
            await connection.end(); // Cierra la conexión de prueba para liberar recursos
        }
    }
}
testDbConnection(); // Llama a la función para ejecutar la prueba de conexión

// --- Variables de Entorno y Objetos Globales Accesibles en Rutas/Controladores ---
// Puedes usar app.set() para guardar valores que tus controladores puedan acceder
// a través de `req.app.get()`. Es una alternativa a pasar `process.env` directamente.
app.set('adminEmail', process.env.ADMIN_EMAIL);
app.set('idCategoriaArmadoPC', parseInt(process.env.ID_CATEGORIA_ARMADO_PC || '4')); // ID para categoría "Armado de PC"


// --- RUTAS DE LA API ---

// Ruta de prueba básica para verificar que el servidor está activo y respondiendo
app.get('/', (req, res) => {
    res.send('API de HARDMAN funcionando y respondiendo en la ruta raíz!');
});

// --- Montar los Routers Modulares ---
// Aquí es donde se conectan los archivos de rutas a la aplicación principal.
// `app.use('/prefijo', tuRouter)`
app.use('/api/contact', contactRoutes); // Monta las rutas de contacto bajo /api/contact

// Aquí montarías tus otros routers a medida que los crees:
// app.use('/api/users', userRoutes);
// app.use('/api/productos', productRoutes);
// app.use('/api/pedidos', pedidoRoutes);
// app.use('/api/pedidos-reparacion', pedidoReparacionRoutes);
// app.use('/api/armado-pc', armadoPcRoutes);


// --- Manejo de Rutas No Encontradas (Middleware 404 Not Found) ---
// Este middleware se ejecuta si ninguna de las rutas anteriores ha manejado la petición
app.use((req, res, next) => {
    res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// --- Manejo de Errores Global (Middleware de Errores) ---
// Este middleware captura cualquier error que se lance en las rutas o middlewares anteriores
app.use((err, req, res, next) => {
    console.error('Error Global del Servidor (stack trace):', err.stack);
    // Puedes personalizar la respuesta de error para no exponer detalles sensibles en producción
    res.status(500).json({
        message: 'Algo salió muy mal en el servidor. Por favor, inténtalo de nuevo más tarde.',
        error: process.env.NODE_ENV === 'production' ? null : err.message // No expongas el error.message en producción
    });
});


// --- Iniciar el Servidor ---
// El servidor comienza a escuchar peticiones en el puerto definido
app.listen(port, () => {
    console.log(`✔ Servidor Express escuchando en http://localhost:${port}`);
    console.log('\n--- Rutas Principales ---');
    console.log(`GET  http://localhost:${port}/           : Ruta de prueba (API activa)`);
    console.log(`POST http://localhost:${port}/api/contact : Enviar formulario de contacto`);
    // Agrega aquí las demás rutas clave a medida que las implementes y pruebes
    console.log('\n¡No olvides implementar bcrypt y JWT para autenticación y seguridad en producción!');
});