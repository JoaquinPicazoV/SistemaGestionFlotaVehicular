const pool = require('../../db');
const crypto = require('crypto');

exports.getPending = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM SOLICITUDES 
            WHERE sol_estado = 'PENDIENTE' 
            ORDER BY sol_fechasalida ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        res.status(500).json({ error: 'Error al obtener solicitudes pendientes' });
    }
};

exports.approve = async (req, res) => {
    const { id } = req.params;
    const { sol_patentevehiculofk, sol_correochoferfk, sol_kmestimado } = req.body;

    try {
        const [currentReq] = await pool.query(
            "SELECT sol_fechasalida, sol_fechallegada FROM SOLICITUDES WHERE sol_id = ?",
            [id]
        );

        if (currentReq.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        const { sol_fechasalida, sol_fechallegada } = currentReq[0];

        // Verificar conflictos de horario con vehículo o chofer
        const [conflicts] = await pool.query(`
            SELECT sol_id, sol_patentevehiculofk, sol_correochoferfk 
            FROM SOLICITUDES 
            WHERE sol_estado = 'APROBADA' 
            AND sol_id != ? 
            AND (
                (sol_patentevehiculofk = ? AND ? IS NOT NULL) OR 
                (sol_correochoferfk = ? AND ? IS NOT NULL)
            )
            AND sol_fechasalida < ? 
            AND sol_fechallegada > ?
        `, [
            id,
            sol_patentevehiculofk, sol_patentevehiculofk,
            sol_correochoferfk, sol_correochoferfk,
            sol_fechallegada, sol_fechasalida
        ]);

        if (conflicts.length > 0) {
            const conflict = conflicts[0];
            let msg = 'Conflicto de horario: ';
            if (conflict.sol_patentevehiculofk === sol_patentevehiculofk) {
                msg += `El vehículo ${sol_patentevehiculofk} ya está ocupado en ese horario. `;
            }
            if (conflict.sol_correochoferfk === sol_correochoferfk) {
                msg += `El chofer ya tiene un viaje asignado en ese horario.`;
            }
            return res.status(409).json({ error: msg });
        }

        await pool.query(
            `UPDATE SOLICITUDES 
             SET sol_estado = 'APROBADA', sol_patentevehiculofk = ?, sol_correochoferfk = ?, sol_idadminfk = ?, sol_kmestimado = ?
             WHERE sol_id = ?`,
            [sol_patentevehiculofk, sol_correochoferfk, req.user.id, sol_kmestimado, id]
        );
        res.json({ message: 'Solicitud aprobada correctamente' });
    } catch (error) {
        console.error("Error approving request:", error);
        res.status(500).json({ error: 'Error al aprobar solicitud' });
    }
};

exports.reject = async (req, res) => {
    const { id } = req.params;
    const { sol_observacionrechazo } = req.body;

    try {
        await pool.query(
            `UPDATE SOLICITUDES 
             SET sol_estado = 'RECHAZADA', sol_observacionrechazo = ?, sol_idadminfk = ?
             WHERE sol_id = ?`,
            [sol_observacionrechazo, req.user.id, id]
        );
        res.json({ message: 'Solicitud rechazada correctamente' });
    } catch (error) {
        console.error("Error rejecting request:", error);
        res.status(500).json({ error: 'Error al rechazar solicitud' });
    }
};

exports.getProcessed = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM SOLICITUDES 
            WHERE sol_estado IN ('APROBADA', 'FINALIZADA', 'RECHAZADA') 
            ORDER BY sol_fechasalida DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching processed requests:", error);
        res.status(500).json({ error: 'Error al obtener solicitudes procesadas' });
    }
};

exports.getDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const [pasajeros] = await pool.query(`
            SELECT p.*, tp.tip_nombre 
            FROM PASAJEROS p
            LEFT JOIN TIPO_PASAJERO tp ON p.pas_idtipofk = tp.tip_id
            WHERE p.pas_idsolicitudfk = ?
        `, [id]);

        const [destinos] = await pool.query(`
            SELECT l.lug_nombre, c.com_nombre 
            FROM SOLICITUD_DESTINO sd
            JOIN LUGAR l ON sd.sde_lugarfk = l.lug_id
            JOIN COMUNA c ON l.lug_comunafk = c.com_id
            WHERE sd.sde_solicitudfk = ?
        `, [id]);

        res.json({ pasajeros, destinos });
    } catch (error) {
        console.error("Error fetching request details:", error);
        res.status(500).json({ error: 'Error al obtener detalles' });
    }
};

exports.create = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const {
            sol_fechasalida,
            sol_fechallegada,
            sol_motivo,
            sol_itinerario,
            sol_tipo,
            sol_requierechofer,
            pasajeros,
            destinos,
            sol_nombresolicitante
        } = req.body;

        const sol_id = crypto.randomUUID();

        // Insertar solicitud
        await conn.query(`
            INSERT INTO SOLICITUDES (
                sol_id, sol_nombresolicitante, sol_fechasalida, sol_fechallegada, sol_estado,
                sol_unidad, sol_motivo, sol_itinerario, sol_tipo, sol_requierechofer, 
                sol_idusuariofk
            ) VALUES (?, ?, ?, ?, 'PENDIENTE', ?, ?, ?, ?, ?, ?)
        `, [
            sol_id,
            sol_nombresolicitante || req.user.name,
            sol_fechasalida,
            sol_fechallegada,
            req.user.name,
            sol_motivo,
            sol_itinerario,
            sol_tipo,
            sol_requierechofer ? 1 : 0,
            req.user.role === 'funcionario' ? req.user.id : null
        ]);

        // Insertar pasajeros
        if (pasajeros && pasajeros.length > 0) {
            const passengerValues = pasajeros.map(p => [p.nombre, sol_id, p.tipo || 1]);
            await conn.query(
                `INSERT INTO PASAJEROS (pas_nombre, pas_idsolicitudfk, pas_idtipofk) VALUES ?`,
                [passengerValues]
            );
        }

        // Insertar destinos
        if (destinos && destinos.length > 0) {
            for (const d of destinos) {
                let lugarId = d.lugar_id;

                if (!lugarId && d.lugar_nombre && d.comuna_id) {
                    const [existing] = await conn.query(
                        'SELECT lug_id FROM LUGAR WHERE lug_nombre = ? AND lug_comunafk = ?',
                        [d.lugar_nombre, d.comuna_id]
                    );

                    if (existing.length > 0) {
                        lugarId = existing[0].lug_id;
                    } else {
                        const [resLugar] = await conn.query(
                            'INSERT INTO LUGAR (lug_nombre, lug_comunafk) VALUES (?, ?)',
                            [d.lugar_nombre, d.comuna_id]
                        );
                        lugarId = resLugar.insertId;
                    }
                }

                if (lugarId) {
                    await conn.query(
                        'INSERT INTO SOLICITUD_DESTINO (sde_solicitudfk, sde_lugarfk) VALUES (?, ?)',
                        [sol_id, lugarId]
                    );
                }
            }
        }

        await conn.commit();
        res.json({ message: 'Solicitud creada exitosamente', id: sol_id });

    } catch (error) {
        await conn.rollback();
        console.error("Error creating request:", error);
        res.status(500).json({ error: 'Error al crear la solicitud: ' + error.message });
    } finally {
        conn.release();
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        let query = "SELECT * FROM SOLICITUDES WHERE 1=1";
        const params = [];

        if (req.user.role === 'funcionario') {
            query += " AND (sol_idusuariofk = ? AND sol_unidad = ?)";
            params.push(req.user.id);
            params.push(req.user.name);
        } else {
            query += " AND sol_idadminfk = ?";
            params.push(req.user.id);
        }

        query += " ORDER BY sol_fechasalida DESC";

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching my requests:", error);
        res.status(500).json({ error: 'Error al obtener mis solicitudes' });
    }
};
