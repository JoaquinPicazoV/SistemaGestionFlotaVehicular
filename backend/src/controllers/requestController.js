const pool = require('../../db');
const crypto = require('crypto');

exports.obtenerPendientes = async (req, res) => {
    try {
        const [solicitudes] = await pool.query(`
            SELECT * FROM SOLICITUDES 
            WHERE sol_estado = 'PENDIENTE' 
            ORDER BY sol_fechasalida ASC
        `);
        res.json(solicitudes);
    } catch (error) {
        console.error("Error obteniendo solicitudes pendientes:", error);
        res.status(500).json({ error: 'Error al obtener solicitudes pendientes' });
    }
};

exports.aprobarSolicitud = async (req, res) => {
    const { id } = req.params;
    const { sol_patentevehiculofk, sol_correochoferfk, sol_kmestimado } = req.body;

    try {
        const [solicitudActual] = await pool.query(
            "SELECT sol_fechasalida, sol_fechallegada FROM SOLICITUDES WHERE sol_id = ?",
            [id]
        );

        if (solicitudActual.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        const { sol_fechasalida, sol_fechallegada } = solicitudActual[0];

        // Verificar conflictos de horario con vehículo o chofer
        const [conflictos] = await pool.query(`
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

        if (conflictos.length > 0) {
            const conflicto = conflictos[0];
            let mensaje = 'Conflicto de horario: ';
            if (conflicto.sol_patentevehiculofk === sol_patentevehiculofk) {
                mensaje += `El vehículo ${sol_patentevehiculofk} ya está ocupado en ese horario. `;
            }
            if (conflicto.sol_correochoferfk === sol_correochoferfk) {
                mensaje += `El chofer ya tiene un viaje asignado en ese horario.`;
            }
            return res.status(409).json({ error: mensaje });
        }

        await pool.query(
            `UPDATE SOLICITUDES 
             SET sol_estado = 'APROBADA', sol_patentevehiculofk = ?, sol_correochoferfk = ?, sol_idadminfk = ?, sol_kmestimado = ?
             WHERE sol_id = ?`,
            [sol_patentevehiculofk, sol_correochoferfk, req.user.id, sol_kmestimado, id]
        );
        res.json({ message: 'Solicitud aprobada correctamente' });
    } catch (error) {
        console.error("Error aprobando solicitud:", error);
        res.status(500).json({ error: 'Error al aprobar solicitud' });
    }
};

exports.rechazarSolicitud = async (req, res) => {
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
        console.error("Error rechazando solicitud:", error);
        res.status(500).json({ error: 'Error al rechazar solicitud' });
    }
};

exports.obtenerProcesadas = async (req, res) => {
    try {
        const [solicitudes] = await pool.query(`
            SELECT s.*, c.cho_nombre as nombre_chofer, v.vehi_marca, v.vehi_modelo, v.vehi_patente
            FROM SOLICITUDES s
            LEFT JOIN CHOFER c ON s.sol_correochoferfk = c.cho_correoinstitucional
            LEFT JOIN VEHICULO v ON s.sol_patentevehiculofk = v.vehi_patente
            WHERE s.sol_estado IN ('APROBADA', 'FINALIZADA', 'RECHAZADA') 
            ORDER BY s.sol_fechasalida DESC
        `);
        res.json(solicitudes);
    } catch (error) {
        console.error("Error obteniendo solicitudes procesadas:", error);
        res.status(500).json({ error: 'Error al obtener solicitudes procesadas' });
    }
};

exports.obtenerDetalles = async (req, res) => {
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
        console.error("Error obteniendo detalles de solicitud:", error);
        res.status(500).json({ error: 'Error al obtener detalles' });
    }
};

exports.crearSolicitud = async (req, res) => {
    const conexion = await pool.getConnection();
    try {
        await conexion.beginTransaction();

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
        await conexion.query(`
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
            const valoresPasajeros = pasajeros.map(p => [p.nombre, sol_id, p.tipo || 1]);
            await conexion.query(
                `INSERT INTO PASAJEROS (pas_nombre, pas_idsolicitudfk, pas_idtipofk) VALUES ?`,
                [valoresPasajeros]
            );
        }

        // Insertar destinos
        if (destinos && destinos.length > 0) {
            for (const d of destinos) {
                let idLugar = d.lugar_id;

                if (!idLugar && d.lugar_nombre && d.comuna_id) {
                    const [existente] = await conexion.query(
                        'SELECT lug_id FROM LUGAR WHERE lug_nombre = ? AND lug_comunafk = ?',
                        [d.lugar_nombre, d.comuna_id]
                    );

                    if (existente.length > 0) {
                        idLugar = existente[0].lug_id;
                    } else {
                        const [resLugar] = await conexion.query(
                            'INSERT INTO LUGAR (lug_nombre, lug_comunafk) VALUES (?, ?)',
                            [d.lugar_nombre, d.comuna_id]
                        );
                        idLugar = resLugar.insertId;
                    }
                }

                if (idLugar) {
                    await conexion.query(
                        'INSERT INTO SOLICITUD_DESTINO (sde_solicitudfk, sde_lugarfk) VALUES (?, ?)',
                        [sol_id, idLugar]
                    );
                }
            }
        }

        await conexion.commit();
        res.json({ message: 'Solicitud creada exitosamente', id: sol_id });

    } catch (error) {
        await conexion.rollback();
        console.error("Error creando solicitud:", error);
        res.status(500).json({ error: 'Error al crear la solicitud: ' + error.message });
    } finally {
        conexion.release();
    }
};

exports.obtenerMisSolicitudes = async (req, res) => {
    try {
        let consulta = "SELECT * FROM SOLICITUDES WHERE 1=1";
        const parametros = [];

        if (req.user.role === 'funcionario') {
            consulta += " AND (sol_idusuariofk = ? AND sol_unidad = ?)";
            parametros.push(req.user.id);
            parametros.push(req.user.name);
        } else {
            consulta += " AND sol_idadminfk = ?";
            parametros.push(req.user.id);
        }

        consulta += " ORDER BY sol_fechasalida DESC";

        const [solicitudes] = await pool.query(consulta, parametros);
        res.json(solicitudes);
    } catch (error) {
        console.error("Error obteniendo mis solicitudes:", error);
        res.status(500).json({ error: 'Error al obtener mis solicitudes' });
    }
};
