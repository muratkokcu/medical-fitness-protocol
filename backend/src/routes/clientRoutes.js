const express = require('express');
const { body } = require('express-validator');
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientStats
} = require('../controllers/clientController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const clientValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Full name cannot be more than 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid date'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),
  body('occupation')
    .optional()
    .trim()
];

router.use(verifyToken);

router.get('/', getClients);
router.get('/stats', getClientStats);
router.get('/:id', getClient);
router.post('/', clientValidation, createClient);
router.put('/:id', clientValidation, updateClient);
router.delete('/:id', deleteClient);

module.exports = router;