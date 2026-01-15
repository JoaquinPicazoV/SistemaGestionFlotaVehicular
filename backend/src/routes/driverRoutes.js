const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const verifyToken = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { body } = require('express-validator');

const createDriverValidation = [
    body('cho_correoinstitucional').isEmail().withMessage('Correo inválido'),
    body('cho_nombre').trim().notEmpty(),
    validate
];

router.get('/', verifyToken, driverController.getAll);
router.post('/', verifyToken, createDriverValidation, driverController.create);
router.put('/:email', verifyToken, driverController.update);
router.delete('/:email', verifyToken, driverController.delete);
router.get('/:email/trips', verifyToken, driverController.getTrips);

module.exports = router;
