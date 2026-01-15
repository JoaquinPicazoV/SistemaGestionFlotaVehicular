const pool = require('../../db');

exports.getComunas = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM COMUNA');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
};

exports.getPassengerTypes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM TIPO_PASAJERO');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching passenger types:", error);
        res.status(500).json({ error: 'Error al obtener tipos de pasajero' });
    }
};
