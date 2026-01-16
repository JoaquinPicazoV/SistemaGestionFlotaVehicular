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

exports.obtenerLugares = async (req, res) => {
    const { comuna_id } = req.query;
    try {
        let query = 'SELECT * FROM LUGAR';
        const params = [];

        if (comuna_id) {
            query += ' WHERE lug_comunafk = ?';
            params.push(comuna_id);
        }

        query += ' ORDER BY lug_nombre ASC';

        const [lugares] = await pool.query(query, params);
        res.json(lugares);
    } catch (error) {
        console.error("Error obteniendo lugares:", error);
        res.status(500).json({ error: 'Error al obtener lugares' });
    }
};
