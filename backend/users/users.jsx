require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise'); 
const cors = require('cors'); 

const app = express();
const port = process.env.PORT || 3000; 

app.use(cors());

// Middleware para parsear JSON en el cuerpo de las peticiones
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

// --- Iniciar el Servidor ---
app.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
    console.log(`Puedes probar la API de usuarios en http://localhost:${port}/api/users`);
});