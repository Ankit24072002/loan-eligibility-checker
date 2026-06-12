const express = require('express');
const { getAllApplications, getDashboardStats, updateApplicationStatus } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, admin);

// @route   GET /api/admin/dashboard
router.get('/dashboard', getDashboardStats);

// @route   GET /api/admin/applications
router.get('/applications', getAllApplications);

// @route   PUT /api/admin/applications/:id
router.put('/applications/:id', updateApplicationStatus);

module.exports = router;
