const cron = require('node-cron');
const pool = require('./db');

const toLocalISOString = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date - offset).toISOString().slice(0, 19).replace('T', ' ');
};

const initScheduler = () => {
    cron.schedule('* * * * *', async () => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();
            const nowLocalStr = toLocalISOString(new Date());

            // Complete finished trips

            const [finishedRequests] = await connection.query(`
                SELECT sol_id, sol_patentevehiculofk 
                FROM SOLICITUDES 
                WHERE sol_estado = 'APROBADA' 
                AND sol_fechallegada <= ?
                FOR UPDATE
            `, [nowLocalStr]);

            if (finishedRequests.length > 0) {
                const ids = finishedRequests.map(r => r.sol_id);
                const patentes = [...new Set(finishedRequests.map(r => r.sol_patentevehiculofk))].filter(p => p);

                // Actualizar estado a FINALIZADA
                await connection.query(
                    `UPDATE SOLICITUDES SET sol_estado = 'FINALIZADA' WHERE sol_id IN (?)`,
                    [ids]
                );


                if (patentes.length > 0) {
                    await connection.query(
                        `UPDATE VEHICULO SET vehi_estado = 'DISPONIBLE' WHERE vehi_patente IN (?)`,
                        [patentes]
                    );
                }
                console.log(`✅ Cron: ${ids.length} viajes finalizados.`);
            }

            // Start scheduled trips

            const [activeRequests] = await connection.query(`
                 SELECT sol_id, sol_patentevehiculofk
                 FROM SOLICITUDES
                 WHERE sol_estado = 'APROBADA'
                 AND sol_fechasalida <= ?
                 AND sol_fechallegada > ?
                 FOR UPDATE
            `, [nowLocalStr, nowLocalStr]);


            if (activeRequests.length > 0) {
                const patentes = [...new Set(activeRequests.map(r => r.sol_patentevehiculofk))].filter(p => p);
                if (patentes.length > 0) {
                    await connection.query(
                        `UPDATE VEHICULO SET vehi_estado = 'EN RUTA' WHERE vehi_patente IN (?)`,
                        [patentes]
                    );
                }
            }

            // Expire pending requests past start time

            const [expiredRequests] = await connection.query(`
                SELECT sol_id
                FROM SOLICITUDES
                WHERE sol_estado = 'PENDIENTE'
                AND sol_fechasalida < ?
                FOR UPDATE
            `, [nowLocalStr]);

            if (expiredRequests.length > 0) {
                const ids = expiredRequests.map(r => r.sol_id);

                await connection.query(
                    `UPDATE SOLICITUDES SET sol_estado = 'RECHAZADA', sol_observacionrechazo = 'Solicitud expirada automáticamente' WHERE sol_id IN (?)`,
                    [ids]
                );
                console.log(`🚫 Cron: ${ids.length} solicitudes pendientes expiradas y rechazadas.`);
            }

            await connection.commit();

        } catch (error) {
            await connection.rollback();
            console.error('❌ Error en scheduler:', error);
        } finally {
            connection.release();
        }
    });

    console.log('⏰ Scheduler initiated');
};

module.exports = initScheduler;
