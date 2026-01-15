const rateLimit = require('express-rate-limit');

// Limitador general para API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3000,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
});

// Limitador específico para login (fuerza bruta)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Demasiados intentos de inicio de sesión.'
});

module.exports = { limiter, loginLimiter };
