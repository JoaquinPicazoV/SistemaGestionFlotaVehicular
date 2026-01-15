const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const verifyToken = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { body } = require('express-validator');

const createRequestValidation = [
    body('sol_fechasalida').isISO8601().toDate(),
    body('sol_fechallegada').isISO8601().toDate(),
    body('sol_motivo').trim().notEmpty(),
    body('pasajeros').isArray(),
    body('destinos').isArray(),
    validate
];

const approveRequestValidation = [
    body('sol_patentevehiculofk').notEmpty(),
    body('sol_correochoferfk').notEmpty(),
    body('sol_kmestimado').isNumeric(),
    validate
];

const rejectRequestValidation = [
    body('sol_observacionrechazo').notEmpty(),
    validate
];

router.get('/pending', verifyToken, requestController.getPending);
router.get('/processed', verifyToken, requestController.getProcessed);
router.get('/my', verifyToken, requestController.getMyRequests);
router.get('/:id/details', verifyToken, requestController.getDetails);
router.post('/', verifyToken, createRequestValidation, requestController.create);
router.put('/:id/approve', verifyToken, approveRequestValidation, requestController.approve);
router.put('/:id/reject', verifyToken, rejectRequestValidation, requestController.reject);

module.exports = router;
