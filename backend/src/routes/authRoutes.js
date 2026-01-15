const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter } = require('../middlewares/rateLimit');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/check', verifyToken, authController.checkAuth);
router.get('/setup/create-admin', authController.createAdmin);

module.exports = router;
