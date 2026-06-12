const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Step 1: Loan Details
    loanAmount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [10000, 'Minimum loan amount is ₹10,000'],
      max: [5000000, 'Maximum loan amount is ₹50,00,000'],
    },
    purpose: {
      type: String,
      required: [true, 'Loan purpose is required'],
      enum: [
        'home',
        'car',
        'education',
        'personal',
        'business',
        'medical',
        'wedding',
        'travel',
        'other',
      ],
    },
    // Step 2: Tenure
    tenure: {
      type: Number,
      required: [true, 'Loan tenure is required'],
      enum: [12, 24, 36, 48, 60],
    },
    // Calculated EMI details
    interestRate: {
      type: Number,
      default: 10.5, // Default annual interest rate
    },
    monthlyEMI: {
      type: Number,
      default: 0,
    },
    totalInterest: {
      type: Number,
      default: 0,
    },
    totalPayable: {
      type: Number,
      default: 0,
    },
    // Eligibility result
    eligibilityStatus: {
      type: String,
      enum: ['eligible', 'not_eligible', 'pending'],
      default: 'pending',
    },
    rejectionReasons: [
      {
        type: String,
      },
    ],
    foir: {
      type: Number,
      default: 0,
    },
    // Application status tracking
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'SUBMITTED',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
        },
        date: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: '',
        },
      },
    ],
    adminNote: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    approvedAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add initial status to history on creation
loanApplicationSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: 'SUBMITTED',
      date: new Date(),
      note: 'Application submitted successfully',
    });
  }
  next();
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
