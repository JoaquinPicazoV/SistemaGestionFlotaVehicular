const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const verifyToken = require('../middlewares/authMiddleware');

router.get('/bi', verifyToken, statsController.obtenerBI);
router.get('/summary', verifyToken, statsController.obtenerResumen);

module.exports = router;
