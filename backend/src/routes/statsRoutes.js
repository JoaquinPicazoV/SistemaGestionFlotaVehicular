const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const verifyToken = require('../middlewares/authMiddleware');

router.get('/bi', verifyToken, statsController.getBI);
router.get('/summary', verifyToken, statsController.getSummary);

module.exports = router;
