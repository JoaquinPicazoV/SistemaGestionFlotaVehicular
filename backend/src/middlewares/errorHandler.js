const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    const statusCode = err.statusCode || 500;

    // En producción, ocultamos errores de base de datos o internos para no exponer info sensible
    let message = err.message || 'Error Interno del Servidor';
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Ha ocurrido un error inesperado. Por favor contacte al soporte.';
    }

    res.status(statusCode).json({
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
