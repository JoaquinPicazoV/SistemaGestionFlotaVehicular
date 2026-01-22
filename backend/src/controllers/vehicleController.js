const pool = require('../../db');

exports.obtenerTodos = async (req, res) => {
    try {
        const [vehiculos] = await pool.query('SELECT * FROM VEHICULO');
        res.json(vehiculos);
    } catch (error) {
        console.error("Error obteniendo vehículos:", error);
        res.status(500).json({ error: 'Error al obtener vehículos' });
    }
};

exports.crearVehiculo = async (req, res) => {
    const {
        vehi_patente, vehi_marca, vehi_modelo, vehi_anio, vehi_color, vehi_tipo,
        vehi_motor, vehi_chasis, vehi_capacidad, vehi_capacidad_carga,
        vehi_inventario, vehi_propietario, vehi_resolucion, vehi_lugaraparcamiento,
        vehi_poliza, vehi_multas, vehi_estado
    } = req.body;

    try {
        await pool.query(
            `INSERT INTO VEHICULO (
                vehi_patente, vehi_marca, vehi_modelo, vehi_anio, vehi_color, vehi_tipo,
                vehi_motor, vehi_chasis, vehi_capacidad, vehi_capacidad_carga,
                vehi_inventario, vehi_propietario, vehi_resolucion, vehi_lugaraparcamiento,
                vehi_poliza, vehi_multas, vehi_estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                vehi_patente, vehi_marca, vehi_modelo, vehi_anio, vehi_color, vehi_tipo || 'Vehículo',
                vehi_motor, vehi_chasis, vehi_capacidad, vehi_capacidad_carga,
                vehi_inventario, vehi_propietario, vehi_resolucion, vehi_lugaraparcamiento,
                vehi_poliza, vehi_multas, vehi_estado || 'DISPONIBLE'
            ]
        );
        res.json({ message: 'Vehículo creado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'La patente ya está registrada.' });
        }
        console.error("Error creando vehículo:", error);
        res.status(500).json({ error: 'Error al crear vehículo' });
    }
};

exports.actualizarVehiculo = async (req, res) => {
    const { patente } = req.params;
    const {
        vehi_marca, vehi_modelo, vehi_anio, vehi_color, vehi_tipo,
        vehi_motor, vehi_chasis, vehi_capacidad, vehi_capacidad_carga,
        vehi_inventario, vehi_propietario, vehi_resolucion, vehi_lugaraparcamiento,
        vehi_poliza, vehi_multas, vehi_estado
    } = req.body;

    try {
        await pool.query(
            `UPDATE VEHICULO SET 
                vehi_marca=?, vehi_modelo=?, vehi_anio=?, vehi_color=?, vehi_tipo=?,
                vehi_motor=?, vehi_chasis=?, vehi_capacidad=?, vehi_capacidad_carga=?,
                vehi_inventario=?, vehi_propietario=?, vehi_resolucion=?, vehi_lugaraparcamiento=?,
                vehi_poliza=?, vehi_multas=?, vehi_estado=? 
             WHERE vehi_patente=?`,
            [
                vehi_marca, vehi_modelo, vehi_anio, vehi_color, vehi_tipo,
                vehi_motor, vehi_chasis, vehi_capacidad, vehi_capacidad_carga,
                vehi_inventario, vehi_propietario, vehi_resolucion, vehi_lugaraparcamiento,
                vehi_poliza, vehi_multas, vehi_estado,
                patente
            ]
        );
        res.json({ message: 'Vehículo actualizado' });
    } catch (error) {
        console.error("Error actualizando vehículo:", error);
        res.status(500).json({ error: 'Error al actualizar vehículo' });
    }
};

exports.eliminarVehiculo = async (req, res) => {
    const { patente } = req.params;
    try {
        await pool.query('DELETE FROM VEHICULO WHERE vehi_patente=?', [patente]);
        res.json({ message: 'Vehículo eliminado' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'No se puede eliminar: El vehículo tiene solicitudes asociadas.' });
        }
        console.error("Error eliminando vehículo:", error);
        res.status(500).json({ error: 'Error al eliminar vehículo' });
    }
};

exports.obtenerViajes = async (req, res) => {
    const { patente } = req.params;
    try {
        const [viajes] = await pool.query(`
            SELECT sol_id, sol_unidad, sol_motivo, sol_fechasalida, sol_fechallegada, sol_kmestimado
            FROM SOLICITUDES
            WHERE sol_patentevehiculofk = ?
            AND sol_estado IN ('APROBADA', 'PENDIENTE')
            AND sol_fechasalida >= NOW()
            ORDER BY sol_fechasalida ASC
            LIMIT 10
        `, [patente]);
        res.json(viajes);
    } catch (error) {
        console.error("Error obteniendo viajes de vehículo:", error);
        res.status(500).json({ error: 'Error al obtener viajes del vehículo' });
    }
};
