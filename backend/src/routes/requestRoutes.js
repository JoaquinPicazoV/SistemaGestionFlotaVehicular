const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const verifyToken = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { body } = require('express-validator');

const validacionCrearSolicitud = [
    body('sol_fechasalida').isISO8601().toDate(),
    body('sol_fechallegada').isISO8601().toDate(),
    body('sol_motivo').trim().notEmpty(),
    body('pasajeros').isArray(),
    body('destinos').isArray(),
    validate
];

const validacionAprobarSolicitud = [
    body('sol_patentevehiculofk').notEmpty().withMessage('La patente es obligatoria'),
    validate
];

const validacionRechazarSolicitud = [
    body('sol_observacionrechazo').notEmpty(),
    validate
];

router.get('/pending', verifyToken, requestController.obtenerPendientes);
router.get('/processed', verifyToken, requestController.obtenerProcesadas);
router.get('/my', verifyToken, requestController.obtenerMisSolicitudes);
router.get('/:id/details', verifyToken, requestController.obtenerDetalles);
router.post('/', verifyToken, validacionCrearSolicitud, requestController.crearSolicitud);
router.post('/admin', verifyToken, validacionCrearSolicitud, requestController.crearSolicitudAdmin);
router.put('/:id/approve', verifyToken, validacionAprobarSolicitud, requestController.aprobarSolicitud);
router.put('/:id/reject', verifyToken, validacionRechazarSolicitud, requestController.rechazarSolicitud);

module.exports = router;
