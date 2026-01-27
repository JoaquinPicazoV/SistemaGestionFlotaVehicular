const express = require('express');
const router = express.Router();
const referenceController = require('../controllers/referenceController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/comunas', referenceController.obtenerComunas);
router.get('/passenger-types', verificarToken, referenceController.obtenerTiposPasajero);
router.get('/places', verificarToken, referenceController.obtenerLugares);
router.get('/establishments', verificarToken, referenceController.obtenerEstablecimientos);
router.get('/units', verificarToken, referenceController.obtenerUnidades);

module.exports = router;
