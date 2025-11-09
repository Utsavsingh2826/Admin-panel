import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-admin');
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@jewelry.com' });
    if (existingUser) {
      console.log('Test user already exists!');
      process.exit(0);
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const user = await User.create({
      name: 'Admin User',
      email: 'admin@jewelry.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isLocked: false,
      loginAttempts: 0,
    });

    console.log('Test user created successfully!');
    console.log('Email: admin@jewelry.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser();

