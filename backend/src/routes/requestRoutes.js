const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { verificarToken, requerirAdmin } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { body } = require('express-validator');

const validacionCrearSolicitud = [
    body('sol_fechasalida').isISO8601().toDate(),
    body('sol_fechallegada').isISO8601().toDate(),
    body('sol_motivo').trim().notEmpty(),
    body('sol_itinerario').trim().notEmpty(),
    body('sol_nombresolicitante').trim().notEmpty(),
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

router.get('/pending', verificarToken, requestController.obtenerPendientes);
router.get('/processed', verificarToken, requestController.obtenerProcesadas);
router.get('/my', verificarToken, requestController.obtenerMisSolicitudes);
router.get('/:id/details', verificarToken, requestController.obtenerDetalles);
router.post('/', verificarToken, validacionCrearSolicitud, requestController.crearSolicitud);
router.post('/admin', verificarToken, requerirAdmin, validacionCrearSolicitud, requestController.crearSolicitudAdmin);
router.put('/:id/approve', verificarToken, requerirAdmin, validacionAprobarSolicitud, requestController.aprobarSolicitud);
router.put('/:id/reject', verificarToken, requerirAdmin, validacionRechazarSolicitud, requestController.rechazarSolicitud);
router.put('/:id/cancel', verificarToken, requestController.cancelarSolicitud);

module.exports = router;
