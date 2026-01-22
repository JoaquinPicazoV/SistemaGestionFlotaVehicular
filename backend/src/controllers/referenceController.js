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
        let consulta = 'SELECT * FROM LUGAR';
        const parametros = [];

        if (comuna_id) {
            consulta += ' WHERE lug_comunafk = ?';
            parametros.push(comuna_id);
        }

        consulta += ' ORDER BY lug_nombre ASC';

        const [lugares] = await pool.query(consulta, parametros);
        res.json(lugares);
    } catch (error) {
        console.error("Error obteniendo lugares:", error);
        res.status(500).json({ error: 'Error al obtener lugares' });
    }
};

exports.obtenerEstablecimientos = async (req, res) => {
    const { comuna_id } = req.query;
    try {
        let consulta = 'SELECT * FROM ESTABLECIMIENTO';
        const parametros = [];

        if (comuna_id) {
            consulta += ' WHERE est_comunafk = ?';
            parametros.push(comuna_id);
        }

        consulta += ' ORDER BY est_nombre ASC';

        const [establecimientos] = await pool.query(consulta, parametros);
        res.json(establecimientos);
    } catch (error) {
        console.error("Error obteniendo establecimientos:", error);
        res.status(500).json({ error: 'Error al obtener establecimientos' });
    }
};
