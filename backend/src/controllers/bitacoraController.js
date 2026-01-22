const pool = require('../../db');

// Obtener historial de bitácora de un vehículo
exports.obtenerBitacora = async (req, res) => {
    const { patente } = req.params;
    try {
        const [registros] = await pool.query(
            'SELECT * FROM BITACORA_VEHICULO WHERE bit_patentevehiculofk = ? ORDER BY bit_fecha DESC',
            [patente]
        );
        res.json(registros);
    } catch (error) {
        console.error("Error obteniendo bitácora:", error);
        res.status(500).json({ error: 'Error al obtener bitácora' });
    }
};

// Crear nueva entrada en la bitácora
exports.crearEntrada = async (req, res) => {
    const { patente } = req.params;
    const {
        bit_fecha,
        bit_funcionario_responsable,
        bit_kilometraje,
        bit_evento,
        bit_mecanico,
        bit_valor_mantencion,
        bit_observaciones
    } = req.body;

    try {
        await pool.query(
            `INSERT INTO BITACORA_VEHICULO (
                bit_patentevehiculofk, bit_fecha, bit_funcionario_responsable, 
                bit_kilometraje, bit_evento, bit_mecanico, bit_valor_mantencion, bit_observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patente, bit_fecha, bit_funcionario_responsable,
                bit_kilometraje, bit_evento, bit_mecanico, bit_valor_mantencion, bit_observaciones
            ]
        );
        res.json({ message: 'Entrada de bitácora creada exitosamente' });
    } catch (error) {
        console.error("Error creando entrada de bitácora:", error);
        res.status(500).json({ error: 'Error al crear entrada de bitácora' });
    }
};

// Actualizar entrada
exports.actualizarEntrada = async (req, res) => {
    const { id } = req.params;
    const {
        bit_fecha,
        bit_funcionario_responsable,
        bit_kilometraje,
        bit_evento,
        bit_mecanico,
        bit_valor_mantencion,
        bit_observaciones
    } = req.body;

    try {
        await pool.query(
            `UPDATE BITACORA_VEHICULO SET 
                bit_fecha=?, bit_funcionario_responsable=?, bit_kilometraje=?, 
                bit_evento=?, bit_mecanico=?, bit_valor_mantencion=?, bit_observaciones=?
            WHERE bit_id=?`,
            [
                bit_fecha, bit_funcionario_responsable, bit_kilometraje,
                bit_evento, bit_mecanico, bit_valor_mantencion, bit_observaciones, id
            ]
        );
        res.json({ message: 'Entrada actualizada exitosamente' });
    } catch (error) {
        console.error("Error actualizando entrada:", error);
        res.status(500).json({ error: 'Error al actualizar entrada' });
    }
};

// Eliminar entrada
exports.eliminarEntrada = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM BITACORA_VEHICULO WHERE bit_id = ?', [id]);
        res.json({ message: 'Entrada eliminada exitosamente' });
    } catch (error) {
        console.error("Error eliminando entrada:", error);
        res.status(500).json({ error: 'Error al eliminar entrada' });
    }
};
