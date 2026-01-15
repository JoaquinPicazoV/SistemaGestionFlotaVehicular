const express = require('express');
const router = express.Router();
const referenceController = require('../controllers/referenceController');
const verifyToken = require('../middlewares/authMiddleware');

router.get('/comunas', referenceController.getComunas);
router.get('/passenger-types', verifyToken, referenceController.getPassengerTypes);

module.exports = router;
