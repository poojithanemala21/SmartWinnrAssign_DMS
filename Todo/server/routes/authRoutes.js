const express = require('express');
const { registerUser, loginUser, getUsers, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.get('/users', protect, getUsers);

module.exports = router;
