const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const verifyToken = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { body, param } = require('express-validator');

const createVehicleValidation = [
    body('vehi_patente').trim().notEmpty().withMessage('Patente requerida').isLength({ min: 6, max: 8 }),
    body('vehi_marca').trim().notEmpty(),
    body('vehi_modelo').trim().notEmpty(),
    body('vehi_capacidad').isInt({ min: 1 }),
    body('vehi_estado').isIn(['DISPONIBLE', 'EN RUTA', 'MANTENCION']),
    validate
];

const updateVehicleValidation = [
    param('patente').notEmpty(),
    body('vehi_marca').optional().trim(),
    body('vehi_modelo').optional().trim(),
    body('vehi_capacidad').optional().isInt({ min: 1 }),
    body('vehi_estado').optional().isIn(['DISPONIBLE', 'EN RUTA', 'MANTENCION']),
    validate
];

router.get('/', verifyToken, vehicleController.getAll);
router.post('/', verifyToken, createVehicleValidation, vehicleController.create);
router.put('/:patente', verifyToken, updateVehicleValidation, vehicleController.update);
router.delete('/:patente', verifyToken, vehicleController.delete);
router.get('/:patente/trips', verifyToken, vehicleController.getTrips);

module.exports = router;
