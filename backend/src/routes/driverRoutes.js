const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const verifyToken = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { body } = require('express-validator');

const validacionCrearChofer = [
    body('cho_correoinstitucional').isEmail().withMessage('Correo inválido'),
    body('cho_nombre').trim().notEmpty(),
    validate
];

router.get('/', verifyToken, driverController.obtenerTodos);
router.post('/', verifyToken, validacionCrearChofer, driverController.crearChofer);
router.put('/:email', verifyToken, driverController.actualizarChofer);
router.delete('/:email', verifyToken, driverController.eliminarChofer);
router.get('/:email/trips', verifyToken, driverController.obtenerViajes);

module.exports = router;
