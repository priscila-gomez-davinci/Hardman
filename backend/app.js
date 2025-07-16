import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './src/config/db.js'; 
import contactRoutes from './src/routes/contactRoutes.js';
import productRoutes from './src/routes/productRoutes.js'; 
import categoryRoutes from './src/routes/categoryRoutes.js'; 
import repairOrderRoutes from './src/routes/repairOrderRoutes.js'; 
import orderRoutes from './src/routes/orderRoutes.js'; 
import authRoutes from './src/routes/authRoutes.js'; 
import userRoutes from './src/routes/userRoutes.js'; 




const app = express();
const port = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());


// --- Rutas de la API ---
app.use('/api/contact', contactRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/repair-orders', repairOrderRoutes); 
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes); 





// --- Manejadores de Errores (siempre al final) ---
app.use((req, res, next) => {
 res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
console.error('Error Global del Servidor:', err.stack);
res.status(500).json({ message: 'Error interno del servidor.' });
});


const startServer = async () => {
     try {
 // 1. Primero, probamos la conexión al pool de la base de datos.
 await pool.query('SELECT 1');
 console.log('✔ Conexión al pool de la base de datos exitosa.');

 // 2. Si la conexión es exitosa, ponemos el servidor a escuchar.
 app.listen(port, () => {
 console.log(`Servidor Express escuchando en http://localhost:${port}`);
 });

 } catch (error) {
console.error('Fallo fatal al conectar con la base de datos. El servidor no se iniciará.');
 console.error(error.message);
 process.exit(1); 
 }
};


startServer();