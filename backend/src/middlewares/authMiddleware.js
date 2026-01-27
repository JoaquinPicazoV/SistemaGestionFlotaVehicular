const jwt = require('jsonwebtoken');

const CLAVE_SECRETA = process.env.JWT_SECRET;

if (!CLAVE_SECRETA) {
    throw new Error('FATAL: JWT_SECRET no está definido en el entorno.');
}

const verificarToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json({ error: 'Acceso denegado. No hay token.' });

    try {
        const verificado = jwt.verify(token, CLAVE_SECRETA);
        req.usuario = verificado;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

const requerirAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
};

module.exports = {
    verificarToken,
    requerirAdmin
};

