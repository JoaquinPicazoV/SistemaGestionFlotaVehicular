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

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [solicitudActual] = await connection.query(
            "SELECT sol_fechasalida, sol_fechallegada, sol_estado FROM SOLICITUDES WHERE sol_id = ? FOR UPDATE",
            [id]
        );

        if (solicitudActual.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        const { sol_fechasalida, sol_fechallegada, sol_estado } = solicitudActual[0];

        if (sol_estado !== 'PENDIENTE') {
            await connection.rollback();
            return res.status(409).json({ error: `La solicitud ya ha sido procesada (Estado actual: ${sol_estado}). Recarga la página.` });
        }

        if (!sol_patentevehiculofk) {
            await connection.rollback();
            return res.status(400).json({ error: 'La patente del vehículo es obligatoria.' });
        }

        const ahora = new Date();
        const fechaFinViaje = new Date(sol_fechallegada);
        const nuevoEstado = fechaFinViaje < ahora ? 'FINALIZADA' : 'APROBADA';

        const [vehiculoData] = await connection.query(
            'SELECT vehi_capacidad, vehi_estado FROM VEHICULO WHERE vehi_patente = ?',
            [sol_patentevehiculofk]
        );

        if (vehiculoData.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Vehículo no encontrado.' });
        }

        const { vehi_capacidad, vehi_estado } = vehiculoData[0];

        if (vehi_estado === 'MANTENCION' || vehi_estado === 'DE BAJA') {
            await connection.rollback();
            return res.status(400).json({ error: `El vehículo seleccionado está en estado: ${vehi_estado}.` });
        }

        const [conteoPasajeros] = await connection.query(
            'SELECT COUNT(*) as total FROM PASAJEROS WHERE pas_idsolicitudfk = ?',
            [id]
        );
        const totalPasajeros = conteoPasajeros[0].total;

        if (totalPasajeros > vehi_capacidad) {
            await connection.rollback();
            return res.status(400).json({
                error: `Capacidad insuficiente. El vehículo soporta ${vehi_capacidad}, pero la solicitud tiene ${totalPasajeros} pasajeros.`
            });
        }

        if (sol_correochoferfk) {
            const [choferData] = await connection.query(
                'SELECT cho_activo FROM CHOFER WHERE cho_correoinstitucional = ?',
                [sol_correochoferfk]
            );

            if (choferData.length === 0) {
                await connection.rollback();
                return res.status(404).json({ error: 'Chofer no encontrado.' });
            }
            if (!choferData[0].cho_activo) {
                await connection.rollback();
                return res.status(400).json({ error: 'El chofer seleccionado se encuentra inactivo.' });
            }
        }

        const [conflictos] = await connection.query(`
            SELECT sol_id, sol_patentevehiculofk, sol_correochoferfk 
            FROM SOLICITUDES 
            WHERE sol_estado IN ('APROBADA', 'FINALIZADA')
            AND sol_id != ? 
            AND (
                (sol_patentevehiculofk = ? AND ? IS NOT NULL) OR 
                (sol_correochoferfk = ? AND ? IS NOT NULL)
            )
            AND sol_fechasalida < ? 
            AND sol_fechallegada > ?
            FOR UPDATE
        `, [
            id,
            sol_patentevehiculofk, sol_patentevehiculofk,
            sol_correochoferfk, sol_correochoferfk,
            sol_fechallegada, sol_fechasalida
        ]);

        if (conflictos.length > 0) {
            await connection.rollback();
            const conflicto = conflictos[0];
            let errores = [];

            if (conflicto.sol_patentevehiculofk === sol_patentevehiculofk) {
                errores.push(`El vehículo ${sol_patentevehiculofk} ya está ocupado.`);
            }
            if (conflicto.sol_correochoferfk === sol_correochoferfk && sol_correochoferfk) {
                errores.push(`El conductor seleccionado ya tiene asignado otro viaje.`);
            }

            const mensaje = errores.length > 0
                ? `Conflicto de Horario: ${errores.join(' Y ')}`
                : 'Conflicto de horario detectado con otro viaje.';

            return res.status(409).json({ error: mensaje });
        }

        await connection.query(
            `UPDATE SOLICITUDES 
             SET sol_estado = ?, sol_patentevehiculofk = ?, sol_correochoferfk = ?, sol_idadminfk = ?, sol_kmestimado = ?
             WHERE sol_id = ?`,
            [nuevoEstado, sol_patentevehiculofk, sol_correochoferfk || null, req.usuario.id, sol_kmestimado || 0, id]
        );

        await connection.commit();
        res.json({ message: `Solicitud ${nuevoEstado === 'FINALIZADA' ? 'finalizada (por fecha pasada)' : 'aprobada'} correctamente` });

    } catch (error) {
        await connection.rollback();
        console.error("Error aprobando solicitud:", error);
        res.status(500).json({ error: 'Error interno del servidor al aprobar.' });
    } finally {
        connection.release();
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
            [sol_observacionrechazo, req.usuario.id, id]
        );
        res.json({ message: 'Solicitud rechazada correctamente' });
    } catch (error) {
        console.error("Error rechazando solicitud:", error);
        res.status(500).json({ error: 'Error al rechazar solicitud' });
    }
};

exports.cancelarSolicitud = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Obtener datos de la solicitud
        const [requests] = await connection.query(
            "SELECT sol_idusuariofk, sol_estado, sol_patentevehiculofk FROM SOLICITUDES WHERE sol_id = ?",
            [id]
        );

        if (requests.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        const solicitud = requests[0];

        // 2. Control de Acceso (IDOR)
        if (req.usuario.rol !== 'admin') {
            // Si no es admin, debe ser el dueño
            if (solicitud.sol_idusuariofk !== req.usuario.id) {
                await connection.rollback();
                return res.status(403).json({ error: 'Acceso denegado: No tienes permiso para cancelar esta solicitud.' });
            }
        }

        // 3. Validación de Estado
        if (['FINALIZADA', 'RECHAZADA', 'CANCELADO'].includes(solicitud.sol_estado)) {
            await connection.rollback();
            return res.status(400).json({ error: `No se puede cancelar una solicitud en estado: ${solicitud.sol_estado}` });
        }

        // 4. Consistencia de Flota: Liberar vehículo si estaba asignado/en ruta
        if (solicitud.sol_estado === 'APROBADA' && solicitud.sol_patentevehiculofk) {
            // Si el vehículo quedó marcado como EN RUTA por esta solicitud, lo devolvemos a DISPONIBLE
            // (Solo si está EN RUTA, si estaba en MANTENCION no lo tocamos)
            await connection.query(
                "UPDATE VEHICULO SET vehi_estado = 'DISPONIBLE' WHERE vehi_patente = ? AND vehi_estado = 'EN RUTA'",
                [solicitud.sol_patentevehiculofk]
            );
        }

        // 5. Ejecutar Cancelación y liberar recursos
        await connection.query(
            `UPDATE SOLICITUDES 
             SET sol_estado = 'CANCELADO', sol_patentevehiculofk = NULL, sol_correochoferfk = NULL
             WHERE sol_id = ?`,
            [id]
        );

        await connection.commit();
        res.json({ message: 'Solicitud cancelada correctamente' });

    } catch (error) {
        await connection.rollback();
        console.error("Error cancelando solicitud:", error);
        res.status(500).json({ error: 'Error al cancelar solicitud' });
    } finally {
        connection.release();
    }
};

exports.obtenerProcesadas = async (req, res) => {
    try {
        const [solicitudes] = await pool.query(`
            SELECT s.*, c.cho_nombre as nombre_chofer, v.vehi_marca, v.vehi_modelo, v.vehi_patente
            FROM SOLICITUDES s
            LEFT JOIN CHOFER c ON s.sol_correochoferfk = c.cho_correoinstitucional
            LEFT JOIN VEHICULO v ON s.sol_patentevehiculofk = v.vehi_patente
            WHERE s.sol_estado IN ('APROBADA', 'FINALIZADA', 'RECHAZADA', 'CANCELADO') 
            ORDER BY s.sol_fechasalida DESC
            LIMIT 100
        `);
        res.json(solicitudes);
    } catch (error) {
        console.error("Error obteniendo solicitudes procesadas:", error);
        res.status(500).json({ error: 'Error al obtener solicitudes procesadas' });
    }
};

exports.obtenerDetalles = async (req, res) => {
    const { id } = req.params;
    const { id: usuarioId, rol } = req.usuario;

    try {
        // Verificar permisos: Admin o Dueño de la solicitud
        const [solicitud] = await pool.query('SELECT sol_idusuariofk FROM SOLICITUDES WHERE sol_id = ?', [id]);

        if (solicitud.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        if (rol !== 'admin' && solicitud[0].sol_idusuariofk !== usuarioId) {
            return res.status(403).json({ error: 'No tienes permiso para ver los detalles de esta solicitud.' });
        }

        const [pasajeros] = await pool.query(`
            SELECT p.*, tp.tip_nombre 
            FROM PASAJEROS p
            LEFT JOIN TIPO_PASAJERO tp ON p.pas_idtipofk = tp.tip_id
            WHERE p.pas_idsolicitudfk = ?
        `, [id]);

        const [destinos] = await pool.query(`
            SELECT 
                COALESCE(l.lug_nombre, e.est_nombre) as lug_nombre,
                COALESCE(cl.com_nombre, ce.com_nombre) as com_nombre,
                CASE WHEN e.est_id IS NOT NULL THEN 'OFICIAL' ELSE 'LIBRE' END as tipo_destino
            FROM SOLICITUD_DESTINO sd
            LEFT JOIN LUGAR l ON sd.sde_lugarfk = l.lug_id
            LEFT JOIN COMUNA cl ON l.lug_comunafk = cl.com_id
            LEFT JOIN ESTABLECIMIENTO e ON sd.sde_establecimientofk = e.est_id
            LEFT JOIN COMUNA ce ON e.est_comunafk = ce.com_id
            WHERE sd.sde_solicitudfk = ?
        `, [id]);

        res.json({ pasajeros, destinos });
    } catch (error) {
        console.error("Error obteniendo detalles de solicitud:", error);
        res.status(500).json({ error: 'Error al obtener detalles' });
    }
};

exports.crearSolicitudAdmin = async (req, res) => {
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
            sol_nombresolicitante,
            sol_unidad,
            sol_kmestimado,
            sol_patentevehiculofk,
            sol_correochoferfk
        } = req.body;

        if (new Date(sol_fechasalida) >= new Date(sol_fechallegada)) {
            await conexion.rollback();
            return res.status(400).json({ error: 'La fecha de llegada debe ser posterior a la de salida.' });
        }

        const [vehiculoData] = await conexion.query(
            'SELECT vehi_capacidad, vehi_estado FROM VEHICULO WHERE vehi_patente = ?',
            [sol_patentevehiculofk]
        );

        if (vehiculoData.length === 0) {
            await conexion.rollback();
            return res.status(404).json({ error: 'Vehículo no encontrado.' });
        }

        const { vehi_capacidad, vehi_estado } = vehiculoData[0];

        if (vehi_estado === 'MANTENCION' || vehi_estado === 'DE BAJA') {
            await conexion.rollback();
            return res.status(400).json({ error: `El vehículo seleccionado está en estado: ${vehi_estado}.` });
        }

        const totalPasajeros = pasajeros ? pasajeros.length : 0;
        if (totalPasajeros > vehi_capacidad) {
            await conexion.rollback();
            return res.status(400).json({
                error: `Capacidad insuficiente. El vehículo soporta ${vehi_capacidad}, pero la solicitud tiene ${totalPasajeros} pasajeros.`
            });
        }

        if (sol_correochoferfk) {
            const [choferData] = await conexion.query(
                'SELECT cho_activo FROM CHOFER WHERE cho_correoinstitucional = ?',
                [sol_correochoferfk]
            );

            if (choferData.length === 0 || !choferData[0].cho_activo) {
                await conexion.rollback();
                return res.status(400).json({ error: 'El chofer seleccionado no existe o está inactivo.' });
            }
        }





        const [conflictos] = await conexion.query(`
            SELECT sol_id, sol_patentevehiculofk, sol_correochoferfk FROM SOLICITUDES 
            WHERE sol_estado = 'APROBADA' 
            AND (
                (sol_patentevehiculofk = ? AND ? IS NOT NULL) OR 
                (sol_correochoferfk = ? AND ? IS NOT NULL)
            )
            AND sol_fechasalida < ? 
            AND sol_fechallegada > ?
            FOR UPDATE
        `, [
            sol_patentevehiculofk, sol_patentevehiculofk,
            sol_correochoferfk, sol_correochoferfk,
            sol_fechallegada, sol_fechasalida
        ]);

        if (conflictos.length > 0) {
            await conexion.rollback();
            const conflicto = conflictos[0];
            let errores = [];

            if (conflicto.sol_patentevehiculofk === sol_patentevehiculofk) {
                errores.push(`El vehículo ${sol_patentevehiculofk} ya está ocupado.`);
            }
            if (conflicto.sol_correochoferfk === sol_correochoferfk && sol_correochoferfk) {
                errores.push(`El conductor seleccionado ya tiene asignado otro viaje.`);
            }

            const mensaje = errores.length > 0
                ? `Conflicto: ${errores.join(' Y ')}`
                : 'Conflicto de horario detectado (recurso ocupado).';

            return res.status(409).json({ error: mensaje });
        }

        const sol_id = crypto.randomUUID();


        const ahora = new Date();
        const fechaFinViaje = new Date(sol_fechallegada);
        const estadoInicial = fechaFinViaje < ahora ? 'FINALIZADA' : 'APROBADA'; // Auto-finalizar si es pasado

        let idUsuarioAsignado = req.usuario.id;
        if (sol_unidad) {
            const [usuariosUnidad] = await conexion.query('SELECT usu_id FROM USUARIO WHERE usu_unidad = ?', [sol_unidad]);
            if (usuariosUnidad.length > 0) {
                idUsuarioAsignado = usuariosUnidad[0].usu_id;
            }
        }

        await conexion.query(`
            INSERT INTO SOLICITUDES (
                sol_id, sol_nombresolicitante, sol_fechasalida, sol_fechallegada, sol_estado,
                sol_unidad, sol_motivo, sol_itinerario, sol_tipo, sol_requierechofer, 
                sol_idusuariofk, sol_kmestimado, sol_patentevehiculofk, sol_correochoferfk, sol_idadminfk
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            sol_id,
            sol_nombresolicitante,
            sol_fechasalida,
            sol_fechallegada,
            estadoInicial,
            sol_unidad,
            sol_motivo,
            sol_itinerario,
            sol_tipo,
            sol_requierechofer ? 1 : 0,
            idUsuarioAsignado,
            sol_kmestimado || 0,
            sol_patentevehiculofk,
            sol_requierechofer ? sol_correochoferfk : null,
            req.usuario.id
        ]);


        if (pasajeros && pasajeros.length > 0) {
            const valoresPasajeros = pasajeros.map(p => [p.nombre, sol_id, p.tipo || 1]);
            await conexion.query(
                `INSERT INTO PASAJEROS (pas_nombre, pas_idsolicitudfk, pas_idtipofk) VALUES ?`,
                [valoresPasajeros]
            );
        }


        if (destinos && destinos.length > 0) {
            for (const d of destinos) {
                if (d.establecimiento_id) {
                    await conexion.query(
                        'INSERT INTO SOLICITUD_DESTINO (sde_solicitudfk, sde_establecimientofk) VALUES (?, ?)',
                        [sol_id, d.establecimiento_id]
                    );
                    continue;
                }

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
        res.json({ message: 'Solicitud creada y aprobada exitosamente', id: sol_id });

    } catch (error) {
        await conexion.rollback();
        console.error("Error creando solicitud admin:", error);
        res.status(500).json({ error: 'Error al procesar la solicitud: ' + error.message });
    } finally {
        conexion.release();
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
            sol_nombresolicitante,
            sol_kmestimado
        } = req.body;

        if (new Date(sol_fechasalida) >= new Date(sol_fechallegada)) {
            await conexion.rollback();
            return res.status(400).json({ error: 'La fecha de llegada debe ser posterior a la de salida.' });
        }


        const ahoraMenosMargen = new Date(Date.now() - 5 * 60 * 1000);
        if (new Date(sol_fechasalida) < ahoraMenosMargen) {
            await conexion.rollback();
            return res.status(400).json({ error: 'La fecha de salida no puede estar en el pasado.' });
        }

        const sol_id = crypto.randomUUID();


        await conexion.query(`
            INSERT INTO SOLICITUDES (
                sol_id, sol_nombresolicitante, sol_fechasalida, sol_fechallegada, sol_estado,
                sol_unidad, sol_motivo, sol_itinerario, sol_tipo, sol_requierechofer, 
                sol_idusuariofk, sol_kmestimado
            ) VALUES (?, ?, ?, ?, 'PENDIENTE', ?, ?, ?, ?, ?, ?, ?)
        `, [
            sol_id,
            sol_nombresolicitante || req.usuario.nombre,
            sol_fechasalida,
            sol_fechallegada,
            req.usuario.nombre,
            sol_motivo,
            sol_itinerario,
            sol_tipo,
            sol_requierechofer ? 1 : 0,
            req.usuario.rol === 'funcionario' ? req.usuario.id : null,
            sol_kmestimado || 0
        ]);


        if (pasajeros && pasajeros.length > 0) {
            const valoresPasajeros = pasajeros.map(p => [p.nombre, sol_id, p.tipo || 1]);
            await conexion.query(
                `INSERT INTO PASAJEROS (pas_nombre, pas_idsolicitudfk, pas_idtipofk) VALUES ?`,
                [valoresPasajeros]
            );
        }


        if (destinos && destinos.length > 0) {
            for (const d of destinos) {

                if (d.establecimiento_id) {
                    await conexion.query(
                        'INSERT INTO SOLICITUD_DESTINO (sde_solicitudfk, sde_establecimientofk) VALUES (?, ?)',
                        [sol_id, d.establecimiento_id]
                    );
                    continue;
                }


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

        if (req.usuario.rol === 'funcionario') {
            consulta += " AND (sol_idusuariofk = ? AND sol_unidad = ?)";
            parametros.push(req.usuario.id);
            parametros.push(req.usuario.nombre);
        } else {
            consulta += " AND sol_idadminfk = ?";
            parametros.push(req.usuario.id);
        }

        consulta += " ORDER BY sol_fechasalida DESC";

        const [solicitudes] = await pool.query(consulta, parametros);
        res.json(solicitudes);
    } catch (error) {
        console.error("Error obteniendo mis solicitudes:", error);
        res.status(500).json({ error: 'Error al obtener mis solicitudes' });
    }
};

exports.obtenerProcesadas = async (req, res) => {
    try {
        const [solicitudes] = await pool.query(`
            SELECT * FROM SOLICITUDES 
            WHERE sol_estado IN ('APROBADA', 'RECHAZADA', 'FINALIZADA')
            ORDER BY sol_fechasalida DESC
            LIMIT 500
        `);
        res.json(solicitudes);
    } catch (error) {
        console.error("Error obteniendo solicitudes procesadas:", error);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
};

exports.rechazarSolicitud = async (req, res) => {
    const { id } = req.params;
    const { sol_observacionrechazo } = req.body;

    try {
        const [result] = await pool.query(
            "UPDATE SOLICITUDES SET sol_estado = 'RECHAZADA', sol_observacionrechazo = ? WHERE sol_id = ?",
            [sol_observacionrechazo, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        res.json({ message: 'Solicitud rechazada correctamente' });
    } catch (error) {
        console.error("Error rechazando solicitud:", error);
        res.status(500).json({ error: 'Error al rechazar solicitud' });
    }
};

exports.cancelarSolicitud = async (req, res) => {
    const { id } = req.params;
    const { id: usuarioId, rol } = req.usuario;

    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        const [solicitud] = await conexion.query("SELECT sol_idusuariofk, sol_estado FROM SOLICITUDES WHERE sol_id = ? FOR UPDATE", [id]);

        if (solicitud.length === 0) {
            await conexion.rollback();
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        const { sol_idusuariofk, sol_estado } = solicitud[0];

        // Verificar permisos
        if (rol !== 'admin' && sol_idusuariofk !== usuarioId) {
            await conexion.rollback();
            return res.status(403).json({ error: 'No tienes permiso para cancelar esta solicitud.' });
        }

        // Si ya finalizó, no se puede cancelar
        if (sol_estado === 'FINALIZADA') {
            await conexion.rollback();
            return res.status(400).json({ error: 'No se puede cancelar una solicitud finalizada.' });
        }

        await conexion.query(
            "UPDATE SOLICITUDES SET sol_estado = 'RECHAZADA', sol_observacionrechazo = 'Cancelada por el usuario.' WHERE sol_id = ?",
            [id]
        );

        await conexion.commit();
        res.json({ message: 'Solicitud cancelada correctamente' });

    } catch (error) {
        await conexion.rollback();
        console.error("Error cancelando solicitud:", error);
        res.status(500).json({ error: 'Error al cancelar solicitud' });
    } finally {
        conexion.release();
    }
};
