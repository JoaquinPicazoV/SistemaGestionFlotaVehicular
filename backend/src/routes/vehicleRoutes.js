const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const verifyToken = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { body, param } = require('express-validator');

const validacionCrearVehiculo = [
    body('vehi_patente').trim().notEmpty().withMessage('Patente requerida').isLength({ min: 6, max: 8 }),
    body('vehi_marca').trim().notEmpty(),
    body('vehi_modelo').trim().notEmpty(),
    body('vehi_capacidad').isInt({ min: 1 }),
    body('vehi_estado').isIn(['DISPONIBLE', 'EN RUTA', 'MANTENCION']),
    body('vehi_tipo').optional().trim(),
    body('vehi_anio').optional().isInt(),
    body('vehi_color').optional().trim(),
    body('vehi_motor').optional().trim(),
    body('vehi_chasis').optional().trim(),
    body('vehi_propietario').optional().trim(),
    validate
];

const validacionActualizarVehiculo = [
    param('patente').notEmpty(),
    body('vehi_marca').optional().trim(),
    body('vehi_modelo').optional().trim(),
    body('vehi_capacidad').optional().isInt({ min: 1 }),
    body('vehi_estado').optional().isIn(['DISPONIBLE', 'EN RUTA', 'MANTENCION']),
    body('vehi_tipo').optional().trim(),
    body('vehi_anio').optional().isInt(),
    body('vehi_color').optional().trim(),
    body('vehi_motor').optional().trim(),
    body('vehi_chasis').optional().trim(),
    body('vehi_propietario').optional().trim(),
    validate
];

router.get('/', verifyToken, vehicleController.obtenerTodos);
router.post('/', verifyToken, validacionCrearVehiculo, vehicleController.crearVehiculo);
router.put('/:patente', verifyToken, validacionActualizarVehiculo, vehicleController.actualizarVehiculo);
router.delete('/:patente', verifyToken, vehicleController.eliminarVehiculo);
router.get('/:patente/trips', verifyToken, vehicleController.obtenerViajes);

// Rutas de Bitácora
const bitacoraController = require('../controllers/bitacoraController');
router.get('/:patente/bitacora', verifyToken, bitacoraController.obtenerBitacora);
router.post('/:patente/bitacora', verifyToken, bitacoraController.crearEntrada);
router.put('/bitacora/:id', verifyToken, bitacoraController.actualizarEntrada);
router.delete('/bitacora/:id', verifyToken, bitacoraController.eliminarEntrada);

module.exports = router;
