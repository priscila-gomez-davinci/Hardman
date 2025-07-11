// src/config/db.js
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

// Condicionalmente añadir la contraseña si existe en .env y no es una cadena vacía
// Esto es importante si la DB realmente no espera el campo 'password' para usuarios sin contraseña
if (process.env.DB_PASSWORD !== undefined && process.env.DB_PASSWORD !== '') {
    dbConfig.password = process.env.DB_PASSWORD;
} else {
    // Si la contraseña es vacía o no existe, asegúrate de que el campo 'password' no se envíe
    // O déjalo como string vacío si sabes que el driver lo maneja bien.
    // Para MySQL, a menudo es preferible no enviar el campo 'password' si no hay.
    // Sin embargo, mysql2 puede manejar un string vacío. El problema es más probable en DB_USER.
    dbConfig.password = ''; // Asegurarse de que al menos es un string vacío
}


async function getConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✔ Conectado a la base de datos MySQL'); // Este log se hará en el app.js para la primera conexión
        return connection;
    } catch (error) {
        console.error('ERROR CRÍTICO AL CONECTAR A LA BASE DE DATOS:', error.message);
        console.error('Detalles del error de conexión a DB:', error); // Mostrar el objeto error completo
        process.exit(1); // Detiene la aplicación si no puede conectar a la DB
    }
}

module.exports = {
    getConnection,
};