const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000, 
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: 'Demasiados intentos de inicio de sesión, cuenta bloqueada temporalmente.'
});

module.exports = { limiter, loginLimiter };
