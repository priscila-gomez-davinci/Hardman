// backend/app.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './src/config/db.js'; // Importamos el pool
import contactRoutes from './src/routes/contactRoutes.js'; // Asegúrate de que este archivo también use 'export'

const app = express();
const port = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());


// --- Rutas de la API ---
app.use('/api/contact', contactRoutes);
// ... aquí irían tus otras rutas


// --- Manejadores de Errores (siempre al final) ---
app.use((req, res, next) => {
 res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
console.error('Error Global del Servidor:', err.stack);
res.status(500).json({ message: 'Error interno del servidor.' });
});


// --- Función para Iniciar el Servidor ---
const startServer = async () => {
     try {
 // 1. Primero, probamos la conexión al pool de la base de datos.
 await pool.query('SELECT 1');
 console.log('✔ Conexión al pool de la base de datos exitosa.');

 // 2. Si la conexión es exitosa, ponemos el servidor a escuchar.
 app.listen(port, () => {
 console.log(`✔ Servidor Express escuchando en http://localhost:${port}`);
 });

 } catch (error) {
console.error('✖ Fallo fatal al conectar con la base de datos. El servidor no se iniciará.');
 console.error(error.message);
 process.exit(1); // Sale de la aplicación si no se puede conectar a la DB
 }
};

// --- Ejecutamos la función para iniciar todo ---
startServer();