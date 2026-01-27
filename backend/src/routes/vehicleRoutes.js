const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { verificarToken, requerirAdmin } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { body, param } = require('express-validator');

const validacionCrearVehiculo = [
    body('vehi_patente').trim().notEmpty().withMessage('Patente requerida').isLength({ min: 6, max: 8 }),
    body('vehi_marca').trim().notEmpty(),
    body('vehi_modelo').trim().notEmpty(),
    body('vehi_capacidad').isInt({ min: 1 }),
    body('vehi_estado').isIn(['DISPONIBLE', 'EN RUTA', 'MANTENCION', 'DE BAJA']),
    body('vehi_tipo').optional().trim(),
    body('vehi_anio').optional().isInt().custom(value => {
        const currentYear = new Date().getFullYear();
        if (value < 1980 || value > currentYear + 1) {
            throw new Error(`El año debe estar entre 1980 y ${currentYear + 1}`);
        }
        return true;
    }),
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
    body('vehi_estado').optional().isIn(['DISPONIBLE', 'EN RUTA', 'MANTENCION', 'DE BAJA']),
    body('vehi_tipo').optional().trim(),
    body('vehi_anio').optional().isInt().custom(value => {
        const currentYear = new Date().getFullYear();
        if (value < 1980 || value > currentYear + 1) {
            throw new Error(`El año debe estar entre 1980 y ${currentYear + 1}`);
        }
        return true;
    }),
    body('vehi_color').optional().trim(),
    body('vehi_motor').optional().trim(),
    body('vehi_chasis').optional().trim(),
    body('vehi_propietario').optional().trim(),
    validate
];

router.get('/', verificarToken, vehicleController.obtenerTodos);
router.post('/', verificarToken, requerirAdmin, validacionCrearVehiculo, vehicleController.crearVehiculo);
router.put('/:patente', verificarToken, requerirAdmin, validacionActualizarVehiculo, vehicleController.actualizarVehiculo);
router.delete('/:patente', verificarToken, requerirAdmin, vehicleController.eliminarVehiculo);
router.get('/:patente/trips', verificarToken, vehicleController.obtenerViajes);

const bitacoraController = require('../controllers/bitacoraController');
router.get('/:patente/bitacora', verificarToken, requerirAdmin, bitacoraController.obtenerBitacora);
router.post('/:patente/bitacora', verificarToken, requerirAdmin, bitacoraController.crearEntrada);
router.put('/bitacora/:id', verificarToken, requerirAdmin, bitacoraController.actualizarEntrada);
router.delete('/bitacora/:id', verificarToken, requerirAdmin, bitacoraController.eliminarEntrada);

module.exports = router;
