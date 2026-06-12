const { validationResult } = require('express-validator');
const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employmentType, monthlyIncome, existingEMIs, cibilScore, name, phone } = req.body;

    const updateFields = {};
    if (employmentType !== undefined) updateFields.employmentType = employmentType;
    if (monthlyIncome !== undefined) updateFields.monthlyIncome = monthlyIncome;
    if (existingEMIs !== undefined) updateFields.existingEMIs = existingEMIs;
    if (cibilScore !== undefined) updateFields.cibilScore = cibilScore;
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { updateProfile, getProfile };
