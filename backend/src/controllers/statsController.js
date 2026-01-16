const pool = require('../../db');

exports.obtenerBI = async (req, res) => {
    try {
        const [
            [desgasteVehiculos],
            [usoVehiculos],
            [tasaRechazo],
            [solicitudesUnidad],
            [motivosViaje],
            [comunasHeatmap],
            [topLugares],
            [tendenciaMensual],
            [cargaChoferes]
        ] = await Promise.all([
            pool.query(`
                SELECT CONCAT(v.vehi_modelo, ' - ', v.vehi_patente) as name, 
                       COALESCE(SUM(s.sol_kmestimado), 0) as value 
                FROM VEHICULO v
                LEFT JOIN SOLICITUDES s ON v.vehi_patente = s.sol_patentevehiculofk AND s.sol_estado = 'FINALIZADA'
                GROUP BY v.vehi_patente
                ORDER BY value DESC
                LIMIT 3
            `),
            pool.query(`
                SELECT v.vehi_patente as name, COUNT(s.sol_id) as value
                FROM VEHICULO v
                LEFT JOIN SOLICITUDES s ON v.vehi_patente = s.sol_patentevehiculofk AND s.sol_estado = 'FINALIZADA'
                GROUP BY v.vehi_patente
            `),
            pool.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN sol_estado = 'RECHAZADA' THEN 1 ELSE 0 END) as rechazadas
                FROM SOLICITUDES
            `),
            pool.query(`
                SELECT sol_unidad as name, COUNT(*) as value
                FROM SOLICITUDES
                GROUP BY sol_unidad
                ORDER BY value DESC
                LIMIT 3
            `),
            pool.query(`SELECT sol_motivo as name, COUNT(*) as value FROM SOLICITUDES GROUP BY sol_motivo`),
            pool.query(`
                SELECT c.com_nombre as name, COUNT(*) as value
                FROM SOLICITUD_DESTINO sd
                JOIN SOLICITUDES s ON sd.sde_solicitudfk = s.sol_id
                JOIN LUGAR l ON sd.sde_lugarfk = l.lug_id
                JOIN COMUNA c ON l.lug_comunafk = c.com_id
                WHERE s.sol_estado = 'FINALIZADA'
                GROUP BY c.com_id
                ORDER BY value DESC
            `),
            pool.query(`
                SELECT l.lug_nombre as nombre, c.com_nombre as comuna, COUNT(*) as visitas
                FROM SOLICITUD_DESTINO sd
                JOIN LUGAR l ON sd.sde_lugarfk = l.lug_id
                JOIN COMUNA c ON l.lug_comunafk = c.com_id
                GROUP BY l.lug_id
                ORDER BY visitas DESC
                LIMIT 10
            `),
            pool.query(`
                SELECT DATE_FORMAT(sol_fechasalida, '%Y-%m') as mes, COUNT(*) as cantidad
                FROM SOLICITUDES
                WHERE sol_fechasalida IS NOT NULL
                GROUP BY mes
                ORDER BY mes ASC
                LIMIT 12
            `),
            pool.query(`
                SELECT c.cho_nombre as name, COUNT(s.sol_id) as viajes
                FROM CHOFER c
                LEFT JOIN SOLICITUDES s ON c.cho_correoinstitucional = s.sol_correochoferfk AND s.sol_estado IN ('FINALIZADA', 'APROBADA')
                GROUP BY c.cho_correoinstitucional
                ORDER BY viajes DESC
            `)
        ]);

        res.json({
            flota: { desgaste: desgasteVehiculos, uso: usoVehiculos },
            demanda: {
                kpi_rechazo: tasaRechazo[0],
                unidades: solicitudesUnidad,
                motivos: motivosViaje
            },
            territorio: { comunas: comunasHeatmap, lugares: topLugares },
            operaciones: { tendencia: tendenciaMensual, choferes: cargaChoferes }
        });

    } catch (error) {
        console.error("Error BI V2:", error);
        res.status(500).json({ error: 'Error calculando BI avanzado' });
    }
};

exports.obtenerResumen = async (req, res) => {
    try {
        const [solicitudesPendientes] = await pool.query("SELECT COUNT(*) as count FROM SOLICITUDES WHERE sol_estado = 'PENDIENTE'");
        const [vehiculosEnRuta] = await pool.query("SELECT COUNT(*) as count FROM VEHICULO WHERE vehi_estado = 'EN RUTA'");
        const [choferesActivos] = await pool.query("SELECT COUNT(*) as count FROM CHOFER WHERE cho_activo = 1");

        const [proximosViajes] = await pool.query(`
            SELECT sol_unidad, sol_fechasalida, sol_motivo 
            FROM SOLICITUDES 
            WHERE sol_estado = 'APROBADA' 
            AND sol_fechasalida BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
            ORDER BY sol_fechasalida ASC
            LIMIT 5
        `);

        const [estadoFlota] = await pool.query("SELECT vehi_estado as name, COUNT(*) as value FROM VEHICULO GROUP BY vehi_estado");

        const [estadisticasKm] = await pool.query(`
            SELECT COALESCE(SUM(sol_kmestimado), 0) as totalKm 
            FROM SOLICITUDES 
            WHERE sol_estado = 'FINALIZADA' 
            AND sol_fechasalida >= DATE_FORMAT(NOW(), '%Y-%m-01')
            AND sol_fechasalida <= LAST_DAY(NOW())
        `);

        const [estadisticasPasajeros] = await pool.query(`
            SELECT COUNT(*) as totalPassengers
            FROM PASAJEROS p
            JOIN SOLICITUDES s ON p.pas_idsolicitudfk = s.sol_id
            WHERE s.sol_estado = 'FINALIZADA'
            AND s.sol_fechasalida >= DATE_FORMAT(NOW(), '%Y-%m-01')
            AND s.sol_fechasalida <= LAST_DAY(NOW())
        `);

        const [unidadesTop] = await pool.query(`
            SELECT sol_unidad, COUNT(*) as trips
            FROM SOLICITUDES
            WHERE sol_estado = 'FINALIZADA'
            GROUP BY sol_unidad
            ORDER BY trips DESC
            LIMIT 3
        `);

        res.json({
            solicitudesPendientes: solicitudesPendientes[0].count,
            vehiculosEnRuta: vehiculosEnRuta[0].count,
            choferesActivos: choferesActivos[0].count,
            kmMesActual: estadisticasKm[0].totalKm,
            pasajerosMes: estadisticasPasajeros[0].totalPassengers,
            unidadesTop: unidadesTop,
            proximosViajes: proximosViajes,
            estadoFlota: estadoFlota
        });
    } catch (error) {
        console.error("Error obteniendo resumen:", error);
        res.status(500).json({ error: 'Error al obtener estadísticas generales' });
    }
};
