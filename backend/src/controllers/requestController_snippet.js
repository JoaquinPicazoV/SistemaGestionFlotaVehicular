
exports.cancelarSolicitud = async (req, res) => {
    const { id } = req.params;
    try {
        // Liberamos los recursos (vehículo/chofer) al cancelar
        await pool.query(
            `UPDATE SOLICITUDES 
             SET sol_estado = 'CANCELADO', sol_patentevehiculofk = NULL, sol_correochoferfk = NULL
             WHERE sol_id = ?`,
            [id]
        );
        res.json({ message: 'Solicitud cancelada correctamente' });
    } catch (error) {
        console.error("Error cancelando solicitud:", error);
        res.status(500).json({ error: 'Error al cancelar solicitud' });
    }
};
