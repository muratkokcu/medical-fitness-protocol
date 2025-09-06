const express = require('express');
const { body } = require('express-validator');
const {
  getAssessments,
  getAssessment,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentStats
} = require('../controllers/assessmentController');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

const assessmentValidation = [
  body('clientId')
    .notEmpty()
    .withMessage('Client ID is required')
    .isMongoId()
    .withMessage('Invalid client ID'),
  body('status')
    .optional()
    .isIn(['draft', 'in_progress', 'completed', 'reviewed'])
    .withMessage('Invalid status'),
  body('assessmentDate')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid date')
];

router.use(verifyToken);

router.get('/', getAssessments);
router.get('/stats', getAssessmentStats);
router.get('/:id', getAssessment);
router.post('/', assessmentValidation, createAssessment);
router.put('/:id', updateAssessment);
router.delete('/:id', authorize('admin'), deleteAssessment);

module.exports = router;