const cron = require('node-cron');
const pool = require('./db');

// Ajustar fecha a zona horaria local
const toLocalISOString = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date - offset);
    return localDate.toISOString().slice(0, 19).replace('T', ' ');
};

const initScheduler = () => {
    // Ejecutar tarea cada minuto
    cron.schedule('* * * * *', async () => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();
            const nowLocalStr = toLocalISOString(new Date());

            // 1. Finalizar viajes que ya concluyeron
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

                // Liberar vehículos asociados
                if (patentes.length > 0) {
                    await connection.query(
                        `UPDATE VEHICULO SET vehi_estado = 'DISPONIBLE' WHERE vehi_patente IN (?)`,
                        [patentes]
                    );
                }
                console.log(`✅ Cron: ${ids.length} viajes finalizados.`);
            }

            // 2. Iniciar viajes programados para ahora
            const [activeRequests] = await connection.query(`
                 SELECT sol_id, sol_patentevehiculofk
                 FROM SOLICITUDES
                 WHERE sol_estado = 'APROBADA'
                 AND sol_fechasalida <= ?
                 AND sol_fechallegada > ?
                 FOR UPDATE
            `, [nowLocalStr, nowLocalStr]);

            // Marcar vehículos como EN RUTA
            if (activeRequests.length > 0) {
                const patentes = [...new Set(activeRequests.map(r => r.sol_patentevehiculofk))].filter(p => p);
                if (patentes.length > 0) {
                    await connection.query(
                        `UPDATE VEHICULO SET vehi_estado = 'EN RUTA' WHERE vehi_patente IN (?)`,
                        [patentes]
                    );
                }
            }

            await connection.commit();

        } catch (error) {
            await connection.rollback();
            console.error('❌ Error en scheduler:', error);
        } finally {
            connection.release();
        }
    });

    console.log('⏰ Scheduler de vehículos iniciado');
};

module.exports = initScheduler;
