const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
});

pool.getConnection()
    .then(conn => {
        pool.releaseConnection(conn);
        console.log('Database connected');
    })
    .catch(err => console.error('Database connection error:', err.message));

module.exports = pool;