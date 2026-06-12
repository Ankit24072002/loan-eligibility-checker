const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing. Add it to BACKEND/.env.');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);

    if (process.env.MONGODB_URI?.includes('mongodb+srv://')) {
      console.error(
        'Atlas tip: check the database username/password and add your current IP in MongoDB Atlas > Network Access.'
      );
    } else {
      console.error(
        'Local tip: make sure the MongoDB Windows service is running and listening on 127.0.0.1:27017.'
      );
    }

    process.exit(1);
  }
};

module.exports = connectDB;
