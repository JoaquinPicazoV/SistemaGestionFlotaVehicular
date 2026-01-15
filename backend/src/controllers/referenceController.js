const pool = require('../../db');

exports.obtenerComunas = async (req, res) => {
    try {
        const [filas] = await pool.query('SELECT * FROM COMUNA');
        res.json(filas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
};

exports.obtenerTiposPasajero = async (req, res) => {
    try {
        const [filas] = await pool.query('SELECT * FROM TIPO_PASAJERO');
        res.json(filas);
    } catch (error) {
        console.error("Error obteniendo tipos de pasajero:", error);
        res.status(500).json({ error: 'Error al obtener tipos de pasajero' });
    }
};
