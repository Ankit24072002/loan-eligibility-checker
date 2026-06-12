const { validationResult } = require('express-validator');
const LoanApplication = require('../models/LoanApplication');
const User = require('../models/User');
const { calculateEMI, calculateTotalInterest, calculateTotalPayable, getInterestRate } = require('../utils/emiCalculator');
const { checkEligibility } = require('../utils/eligibilityEngine');

// @desc    Submit a new loan application
// @route   POST /api/loans
// @access  Private
const submitApplication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { loanAmount, purpose, tenure } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has completed their profile
    if (!user.employmentType || !user.monthlyIncome || !user.cibilScore) {
      return res.status(400).json({
        message: 'Please complete your profile (employment type, monthly income, CIBIL score) before applying for a loan',
      });
    }

    // Calculate interest rate based on purpose and CIBIL score
    const interestRate = getInterestRate(purpose, user.cibilScore);

    // Calculate EMI
    const monthlyEMI = calculateEMI(loanAmount, interestRate, tenure);
    const totalInterest = calculateTotalInterest(monthlyEMI, tenure, loanAmount);
    const totalPayable = calculateTotalPayable(monthlyEMI, tenure);

    // Check eligibility
    const eligibility = checkEligibility(user, monthlyEMI, interestRate, tenure);

    // Create loan application
    const application = await LoanApplication.create({
      user: req.user._id,
      loanAmount,
      purpose,
      tenure,
      interestRate,
      monthlyEMI,
      totalInterest,
      totalPayable,
      eligibilityStatus: eligibility.isEligible ? 'eligible' : 'not_eligible',
      rejectionReasons: eligibility.reasons,
      foir: eligibility.foir,
      status: 'SUBMITTED',
    });

    // Keep every new application in SUBMITTED; admins make the final status decision.
    if (!eligibility.isEligible) {
      console.log(`[EMAIL NOTIFICATION] Dear ${user.name}, your loan application #${application._id} has been submitted with eligibility issues: ${eligibility.reasons.join('; ')}`);
    } else {
      console.log(`📧 [EMAIL NOTIFICATION] Dear ${user.name}, your loan application #${application._id} has been submitted successfully and is now under review.`);
    }

    res.status(201).json({
      application,
      eligibility,
    });
  } catch (error) {
    console.error('Submit application error:', error.message);
    res.status(500).json({ message: 'Server error while submitting application' });
  }
};

// @desc    Get all applications for logged-in user
// @route   GET /api/loans
// @access  Private
const getMyApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'name email');

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single application
// @route   GET /api/loans/:id
// @access  Private
const getApplication = async (req, res) => {
  try {
    const application = await LoanApplication.findById(req.params.id)
      .populate('user', 'name email phone employmentType monthlyIncome cibilScore existingEMIs')
      .populate('reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure user can only view their own applications (unless admin)
    if (application.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.json(application);
  } catch (error) {
    console.error('Get application error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitApplication, getMyApplications, getApplication };
