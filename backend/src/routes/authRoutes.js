const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter } = require('../middlewares/rateLimit');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/login', loginLimiter, authController.iniciarSesion);
router.post('/logout', authController.cerrarSesion);
router.get('/check', verificarToken, authController.verificarSesion);

module.exports = router;

