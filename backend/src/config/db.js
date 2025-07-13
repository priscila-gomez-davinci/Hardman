import mysql from 'mysql2/promise';
import 'dotenv/config';


const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

const pool = mysql.createPool(dbConfig);

// Exportamos el pool para que toda la app lo use
export default pool;