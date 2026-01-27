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
    max: 5, // Límite estricto para evitar fuerza bruta
    message: 'Demasiados intentos de inicio de sesión, cuenta bloqueada temporalmente.'
});

module.exports = { limiter, loginLimiter };
