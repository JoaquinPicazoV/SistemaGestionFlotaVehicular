const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { verificarToken, requerirAdmin } = require('../middlewares/authMiddleware');

router.get('/bi', verificarToken, requerirAdmin, statsController.obtenerBI);
router.get('/summary', verificarToken, requerirAdmin, statsController.obtenerResumen);

module.exports = router;
