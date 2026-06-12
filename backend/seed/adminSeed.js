const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@loancheck.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('   Email: admin@loancheck.com');
      console.log('   Role:', existingAdmin.role);

      // Reset password to a known value so seeding can be idempotent
      existingAdmin.password = 'Admin@123';
      await existingAdmin.save();
      console.log('🔁 Admin password has been reset to: Admin@123');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@loancheck.com',
      password: 'Admin@123',
      phone: '9876543210',
      role: 'admin',
      employmentType: 'salaried',
      monthlyIncome: 100000,
      existingEMIs: 0,
      cibilScore: 800,
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@loancheck.com');
    console.log('   Password: Admin@123');
    console.log('   Role:', admin.role);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
