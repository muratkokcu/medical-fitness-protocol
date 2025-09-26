const express = require('express');
const { body } = require('express-validator');
const { login, getMe, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

router.post('/login', loginValidation, login);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;