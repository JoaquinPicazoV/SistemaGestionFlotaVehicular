const pool = require('./db');

(async () => {
    try {
        const [tables] = await pool.query("SHOW TABLES");
        console.log("Tables:", tables.map(t => Object.values(t)[0]));

        // Find if TIPO_PASAJERO exists
        const tipoTable = tables.map(t => Object.values(t)[0]).find(t => t.toLowerCase().includes('tipo'));

        if (tipoTable) {
            const [rows] = await pool.query(`SELECT * FROM ${tipoTable}`);
            console.log(`${tipoTable} contents:`, rows);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
