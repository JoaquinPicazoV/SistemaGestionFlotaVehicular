const pool = require('./db');

(async () => {
    try {
        const [columns] = await pool.query("SHOW COLUMNS FROM SOLICITUDES");
        console.log("SOLICITUDES Columns:", columns.map(c => c.Field));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
