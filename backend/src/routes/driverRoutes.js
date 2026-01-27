const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { verificarToken, requerirAdmin } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { body } = require('express-validator');

const validacionCrearChofer = [
    body('cho_correoinstitucional').isEmail().withMessage('Correo inválido'),
    body('cho_nombre').trim().notEmpty(),
    validate
];

router.get('/', verificarToken, driverController.obtenerTodos);
router.post('/', verificarToken, requerirAdmin, validacionCrearChofer, driverController.crearChofer);
router.put('/:email', verificarToken, requerirAdmin, driverController.actualizarChofer);
router.delete('/:email', verificarToken, requerirAdmin, driverController.eliminarChofer);
router.get('/:email/trips', verificarToken, driverController.obtenerViajes);

module.exports = router;
