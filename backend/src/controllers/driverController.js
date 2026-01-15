const pool = require('../../db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM CHOFER');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching drivers:", error);
        res.status(500).json({ error: 'Error al obtener choferes' });
    }
};

exports.create = async (req, res) => {
    const { cho_correoinstitucional, cho_nombre, cho_activo } = req.body;
    try {
        await pool.query(
            'INSERT INTO CHOFER (cho_correoinstitucional, cho_nombre, cho_activo) VALUES (?, ?, ?)',
            [cho_correoinstitucional, cho_nombre, cho_activo ? 1 : 0]
        );
        res.json({ message: 'Chofer creado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El correo institucional ya está registrado.' });
        }
        console.error("Error creating driver:", error);
        res.status(500).json({ error: 'Error al crear chofer' });
    }
};

exports.update = async (req, res) => {
    const { email } = req.params;
    const { cho_nombre, cho_activo } = req.body;
    try {
        await pool.query(
            'UPDATE CHOFER SET cho_nombre=?, cho_activo=? WHERE cho_correoinstitucional=?',
            [cho_nombre, cho_activo, email]
        );
        res.json({ message: 'Chofer actualizado' });
    } catch (error) {
        console.error("Error updating driver:", error);
        res.status(500).json({ error: 'Error al actualizar chofer' });
    }
};

exports.delete = async (req, res) => {
    const { email } = req.params;
    try {
        await pool.query('DELETE FROM CHOFER WHERE cho_correoinstitucional=?', [email]);
        res.json({ message: 'Chofer eliminado' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'No se puede eliminar: El chofer tiene viajes asociados.' });
        }
        console.error("Error deleting driver:", error);
        res.status(500).json({ error: 'Error al eliminar chofer' });
    }
};

exports.getTrips = async (req, res) => {
    const { email } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT sol_id, sol_unidad, sol_motivo, sol_fechasalida, sol_fechallegada, sol_kmestimado
            FROM SOLICITUDES
            WHERE sol_correochoferfk = ?
            AND sol_estado IN ('APROBADA', 'PENDIENTE')
            AND sol_fechasalida >= NOW()
            ORDER BY sol_fechasalida ASC
            LIMIT 10
        `, [email]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching driver trips:", error);
        res.status(500).json({ error: 'Error al obtener viajes del chofer' });
    }
};
