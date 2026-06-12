const express = require('express');
const { body } = require('express-validator');
const { calculateEMIDetails } = require('../controllers/emiController');

const router = express.Router();

// @route   POST /api/emi/calculate
router.post(
  '/calculate',
  [
    body('loanAmount')
      .isFloat({ min: 10000, max: 5000000 })
      .withMessage('Loan amount must be between ₹10,000 and ₹50,00,000'),
    body('tenure')
      .isIn([12, 24, 36, 48, 60])
      .withMessage('Tenure must be 12, 24, 36, 48, or 60 months'),
  ],
  calculateEMIDetails
);

module.exports = router;
