// config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// El pool se conecta y prueba la conexión automáticamente.
// Si falla, lanzará un error cuando lo uses la primera vez.
console.log('✔ Pool de conexiones a la base de datos configurado.');

module.exports = pool;