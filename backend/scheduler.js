const cron = require('node-cron');
const pool = require('./db');

const initScheduler = () => {
    cron.schedule('* * * * *', async () => {
        const conexion = await pool.getConnection();

        try {
            await conexion.beginTransaction();

            const [solicitudesFinalizadas] = await conexion.query(`
                SELECT sol_id, sol_patentevehiculofk 
                FROM SOLICITUDES 
                WHERE sol_estado = 'APROBADA' 
                AND sol_fechallegada <= NOW()
                FOR UPDATE
            `);

            if (solicitudesFinalizadas.length > 0) {
                const ids = solicitudesFinalizadas.map(r => r.sol_id);
                const patentes = [...new Set(solicitudesFinalizadas.map(r => r.sol_patentevehiculofk))].filter(p => p);

                await conexion.query(
                    `UPDATE SOLICITUDES SET sol_estado = 'FINALIZADA' WHERE sol_id IN (?)`,
                    [ids]
                );

                if (patentes.length > 0) {
                    await conexion.query(
                        `UPDATE VEHICULO SET vehi_estado = 'DISPONIBLE' 
                         WHERE vehi_patente IN (?) 
                         AND vehi_estado = 'EN RUTA'`,
                        [patentes]
                    );
                }
                console.log(`[CRON] ${ids.length} viajes finalizados.`);
            }

            const [solicitudesActivas] = await conexion.query(`
                 SELECT sol_id, sol_patentevehiculofk
                 FROM SOLICITUDES
                 WHERE sol_estado = 'APROBADA'
                 AND sol_fechasalida <= NOW()
                 AND sol_fechallegada > NOW()
                 FOR UPDATE
            `);

            if (solicitudesActivas.length > 0) {
                const patentesEnRuta = [...new Set(solicitudesActivas.map(r => r.sol_patentevehiculofk))].filter(p => p);

                if (patentesEnRuta.length > 0) {
                    await conexion.query(
                        `UPDATE VEHICULO SET vehi_estado = 'EN RUTA' 
                         WHERE vehi_patente IN (?) AND vehi_estado IN ('DISPONIBLE', 'EN RUTA')`,
                        [patentesEnRuta]
                    );
                }
            }

            const [solicitudesExpiradas] = await conexion.query(`
                SELECT sol_id
                FROM SOLICITUDES
                WHERE sol_estado = 'PENDIENTE'
                AND sol_fechasalida < NOW()
                FOR UPDATE
            `);

            if (solicitudesExpiradas.length > 0) {
                const idsExpirados = solicitudesExpiradas.map(r => r.sol_id);

                await conexion.query(
                    `UPDATE SOLICITUDES 
                     SET sol_estado = 'RECHAZADA', 
                         sol_observacionrechazo = 'Expirada: La fecha de salida ha pasado sin aprobación.' 
                     WHERE sol_id IN (?)`,
                    [idsExpirados]
                );
                console.log(`[CRON] ${idsExpirados.length} solicitudes expiradas procesadas.`);
            }

            await conexion.commit();

        } catch (error) {
            await conexion.rollback();
            console.error('[CRON] Error crítico en scheduler:', error);
        } finally {
            conexion.release();
        }
    });

    console.log('Scheduler started');
};

module.exports = initScheduler;

