const { validationResult } = require('express-validator');
const { calculateEMI, calculateTotalInterest, calculateTotalPayable, generateAmortizationTable, getInterestRate } = require('../utils/emiCalculator');

// @desc    Calculate EMI
// @route   POST /api/emi/calculate
// @access  Public
const calculateEMIDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { loanAmount, annualRate, interestRate: requestedInterestRate, tenure, purpose, cibilScore } = req.body;

    // Use dynamic rate if purpose is provided, otherwise use the provided rate
    let interestRate = annualRate || requestedInterestRate || 10.5;
    if (purpose) {
      interestRate = getInterestRate(purpose, cibilScore || 700);
    }

    const monthlyEMI = calculateEMI(loanAmount, interestRate, tenure);
    const totalInterest = calculateTotalInterest(monthlyEMI, tenure, loanAmount);
    const totalPayable = calculateTotalPayable(monthlyEMI, tenure);
    const amortizationTable = generateAmortizationTable(loanAmount, interestRate, tenure);

    res.json({
      loanAmount,
      interestRate,
      tenure,
      monthlyEMI,
      totalInterest,
      totalPayable,
      amortizationTable,
    });
  } catch (error) {
    console.error('EMI calculation error:', error.message);
    res.status(500).json({ message: 'Server error during EMI calculation' });
  }
};

module.exports = { calculateEMIDetails };
