const pool = require('../../db');

exports.obtenerTodos = async (req, res) => {
    try {
        const [choferes] = await pool.query('SELECT * FROM CHOFER');
        res.json(choferes);
    } catch (error) {
        console.error("Error obteniendo choferes:", error);
        res.status(500).json({ error: 'Error al obtener choferes' });
    }
};

exports.crearChofer = async (req, res) => {
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
        console.error("Error creando chofer:", error);
        res.status(500).json({ error: 'Error al crear chofer' });
    }
};

exports.actualizarChofer = async (req, res) => {
    const { email } = req.params;
    const { cho_nombre, cho_activo } = req.body;
    try {
        if (cho_activo === false || cho_activo === 0 || cho_activo === '0') {
            const [viajesPendientes] = await pool.query(`
                SELECT sol_id FROM SOLICITUDES 
                WHERE sol_correochoferfk = ? 
                AND sol_estado IN ('PENDIENTE', 'APROBADA')
                AND sol_fechasalida >= NOW()
            `, [email]);

            if (viajesPendientes.length > 0) {
                return res.status(409).json({ error: 'No se puede desactivar: El chofer tiene viajes futuros asignados.' });
            }
        }

        await pool.query(
            'UPDATE CHOFER SET cho_nombre=?, cho_activo=? WHERE cho_correoinstitucional=?',
            [cho_nombre, cho_activo, email]
        );
        res.json({ message: 'Chofer actualizado' });
    } catch (error) {
        console.error("Error actualizando chofer:", error);
        res.status(500).json({ error: 'Error al actualizar chofer' });
    }
};

exports.eliminarChofer = async (req, res) => {
    const { email } = req.params;
    try {
        const [viajesActivos] = await pool.query(`
            SELECT sol_id FROM SOLICITUDES 
            WHERE sol_correochoferfk = ? 
            AND sol_estado IN ('PENDIENTE', 'APROBADA')
        `, [email]);

        if (viajesActivos.length > 0) {
            return res.status(409).json({ error: 'No se puede eliminar: El chofer tiene viajes pendientes o aprobados asignados.' });
        }

        await pool.query('DELETE FROM CHOFER WHERE cho_correoinstitucional=?', [email]);
        res.json({ message: 'Chofer eliminado' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'No se puede eliminar: El chofer tiene viajes asociados (historial).' });
        }
        console.error("Error eliminando chofer:", error);
        res.status(500).json({ error: 'Error al eliminar chofer' });
    }
};

exports.obtenerViajes = async (req, res) => {
    const { email } = req.params;
    try {
        const [viajes] = await pool.query(`
            SELECT sol_id, sol_unidad, sol_motivo, sol_fechasalida, sol_fechallegada, sol_kmestimado
            FROM SOLICITUDES
            WHERE sol_correochoferfk = ?
            AND sol_estado IN ('APROBADA', 'PENDIENTE')
            AND sol_fechasalida >= NOW()
            ORDER BY sol_fechasalida ASC
            LIMIT 10
        `, [email]);
        res.json(viajes);
    } catch (error) {
        console.error("Error obteniendo viajes de chofer:", error);
        res.status(500).json({ error: 'Error al obtener viajes del chofer' });
    }
};
