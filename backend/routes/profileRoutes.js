const express = require('express');
const { body } = require('express-validator');
const { updateProfile, getProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/profile
router.get('/', protect, getProfile);

// @route   PUT /api/profile
router.put(
  '/',
  protect,
  [
    body('employmentType')
      .optional()
      .isIn(['salaried', 'self-employed', 'business'])
      .withMessage('Employment type must be salaried, self-employed, or business'),
    body('monthlyIncome')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Monthly income must be a positive number'),
    body('existingEMIs')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Existing EMIs must be a positive number'),
    body('cibilScore')
      .optional()
      .isInt({ min: 0, max: 900 })
      .withMessage('CIBIL score must be between 0 and 900'),
  ],
  updateProfile
);

module.exports = router;
