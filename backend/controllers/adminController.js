const LoanApplication = require('../models/LoanApplication');
const User = require('../models/User');

// @desc    Get all applications (admin)
// @route   GET /api/admin/applications
// @access  Private/Admin
const getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const total = await LoanApplication.countDocuments(query);
    const applications = await LoanApplication.find(query)
      .populate('user', 'name email phone employmentType monthlyIncome cibilScore existingEMIs')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      applications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get all applications error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalApplications = await LoanApplication.countDocuments();
    const pendingApplications = await LoanApplication.countDocuments({ status: 'SUBMITTED' });
    const underReview = await LoanApplication.countDocuments({ status: 'UNDER_REVIEW' });
    const approved = await LoanApplication.countDocuments({ status: 'APPROVED' });
    const rejected = await LoanApplication.countDocuments({ status: 'REJECTED' });
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Calculate total loan amount disbursed
    const approvedLoans = await LoanApplication.aggregate([
      { $match: { status: 'APPROVED' } },
      { $group: { _id: null, totalAmount: { $sum: '$loanAmount' }, totalEMI: { $sum: '$monthlyEMI' } } },
    ]);

    const totalDisbursed = approvedLoans.length > 0 ? approvedLoans[0].totalAmount : 0;

    // Approval rate
    const decidedApplications = approved + rejected;
    const approvalRate = decidedApplications > 0 ? ((approved / decidedApplications) * 100).toFixed(1) : 0;

    // Recent applications
    const recentApplications = await LoanApplication.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Loan purpose distribution
    const purposeDistribution = await LoanApplication.aggregate([
      { $group: { _id: '$purpose', count: { $sum: 1 }, totalAmount: { $sum: '$loanAmount' } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalApplications,
      pendingApplications,
      underReview,
      approved,
      rejected,
      totalUsers,
      totalDisbursed,
      approvalRate: parseFloat(approvalRate),
      recentApplications,
      purposeDistribution,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update application status (Approve/Reject)
// @route   PUT /api/admin/applications/:id
// @access  Private/Admin
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, adminNote, approvedAmount } = req.body;

    if (!['UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be UNDER_REVIEW, APPROVED, or REJECTED' });
    }

    // Require a rejection reason when rejecting
    if (status === 'REJECTED' && (!adminNote || adminNote.trim().length === 0)) {
      return res.status(400).json({ message: 'Rejection reason (adminNote) is required when rejecting an application' });
    }

    const application = await LoanApplication.findById(req.params.id).populate('user', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.adminNote = adminNote || '';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();

    // If approved, record approved amount (default to requested loanAmount)
    if (status === 'APPROVED') {
      application.approvedAmount = approvedAmount && Number(approvedAmount) > 0 ? Number(approvedAmount) : application.loanAmount;
    }

    // If rejected, store the reason
    if (status === 'REJECTED' && adminNote) {
      application.rejectionReasons = application.rejectionReasons || [];
      application.rejectionReasons.push(adminNote);
    }

    // Add to status history
    application.statusHistory.push({
      status,
      date: new Date(),
      note: adminNote || `Status updated to ${status} by admin`,
    });

    await application.save();

    // Mock email notification
    const statusMessages = {
      UNDER_REVIEW: `your loan application #${application._id} is now under review.`,
      APPROVED: `congratulations! Your loan application #${application._id} has been approved! Amount: ₹${application.approvedAmount.toLocaleString('en-IN')}`,
      REJECTED: `your loan application #${application._id} has been rejected. Reason: ${adminNote || 'Not provided'}`,
    };

    console.log(`📧 [EMAIL NOTIFICATION] Dear ${application.user.name}, ${statusMessages[status]}`);

    res.json({
      message: `Application ${status.toLowerCase()} successfully`,
      application,
    });
  } catch (error) {
    console.error('Update application status error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllApplications, getDashboardStats, updateApplicationStatus };
