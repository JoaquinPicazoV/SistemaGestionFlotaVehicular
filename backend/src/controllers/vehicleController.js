const pool = require('../../db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM VEHICULO');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        res.status(500).json({ error: 'Error al obtener vehículos' });
    }
};

exports.create = async (req, res) => {
    const { vehi_patente, vehi_marca, vehi_modelo, vehi_capacidad, vehi_estado } = req.body;
    try {
        await pool.query(
            'INSERT INTO VEHICULO (vehi_patente, vehi_marca, vehi_modelo, vehi_capacidad, vehi_estado) VALUES (?, ?, ?, ?, ?)',
            [vehi_patente, vehi_marca, vehi_modelo, vehi_capacidad, vehi_estado]
        );
        res.json({ message: 'Vehículo creado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'La patente ya está registrada.' });
        }
        console.error("Error creating vehicle:", error);
        res.status(500).json({ error: 'Error al crear vehículo' });
    }
};

exports.update = async (req, res) => {
    const { patente } = req.params;
    const { vehi_marca, vehi_modelo, vehi_capacidad, vehi_estado } = req.body;
    try {
        await pool.query(
            'UPDATE VEHICULO SET vehi_marca=?, vehi_modelo=?, vehi_capacidad=?, vehi_estado=? WHERE vehi_patente=?',
            [vehi_marca, vehi_modelo, vehi_capacidad, vehi_estado, patente]
        );
        res.json({ message: 'Vehículo actualizado' });
    } catch (error) {
        console.error("Error updating vehicle:", error);
        res.status(500).json({ error: 'Error al actualizar vehículo' });
    }
};

exports.delete = async (req, res) => {
    const { patente } = req.params;
    try {
        await pool.query('DELETE FROM VEHICULO WHERE vehi_patente=?', [patente]);
        res.json({ message: 'Vehículo eliminado' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'No se puede eliminar: El vehículo tiene solicitudes asociadas.' });
        }
        console.error("Error deleting vehicle:", error);
        res.status(500).json({ error: 'Error al eliminar vehículo' });
    }
};

exports.getTrips = async (req, res) => {
    const { patente } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT sol_id, sol_unidad, sol_motivo, sol_fechasalida, sol_fechallegada, sol_kmestimado
            FROM SOLICITUDES
            WHERE sol_patentevehiculofk = ?
            AND sol_estado IN ('APROBADA', 'PENDIENTE')
            AND sol_fechasalida >= NOW()
            ORDER BY sol_fechasalida ASC
            LIMIT 10
        `, [patente]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching vehicle trips:", error);
        res.status(500).json({ error: 'Error al obtener viajes del vehículo' });
    }
};
