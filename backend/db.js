const mysql = require('mysql2/promise');

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'slep_flota_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexión inicial
pool.getConnection()
    .then(connection => {
        pool.releaseConnection(connection);
        console.log('✅ BD MySQL Conectada Exitosamente');
    })
    .catch(err => {
        console.error('❌ Error conectando a la BD:', err.message);
    });

module.exports = pool;