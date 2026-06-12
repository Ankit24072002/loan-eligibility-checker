const express = require('express');
const { body } = require('express-validator');
const { submitApplication, getMyApplications, getApplication } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/loans
router.post(
  '/',
  protect,
  [
    body('loanAmount')
      .isFloat({ min: 10000, max: 5000000 })
      .withMessage('Loan amount must be between ₹10,000 and ₹50,00,000'),
    body('purpose')
      .isIn(['home', 'car', 'education', 'personal', 'business', 'medical', 'wedding', 'travel', 'other'])
      .withMessage('Invalid loan purpose'),
    body('tenure')
      .isIn([12, 24, 36, 48, 60])
      .withMessage('Tenure must be 12, 24, 36, 48, or 60 months'),
  ],
  submitApplication
);

// @route   GET /api/loans
router.get('/', protect, getMyApplications);

// @route   GET /api/loans/:id
router.get('/:id', protect, getApplication);

module.exports = router;
