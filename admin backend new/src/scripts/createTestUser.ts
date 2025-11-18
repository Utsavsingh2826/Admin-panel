import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminUser from '../models/AdminUser';

dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-admin');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingUser = await AdminUser.findOne({ email: 'admin@jewelry.com' });
    if (existingUser) {
      console.log('Test admin user already exists!');
      process.exit(0);
    }

    // Create test admin user (password will be hashed by pre-save middleware)
    await AdminUser.create({
      name: 'Admin User',
      email: 'admin@jewelry.com',
      password: 'admin123',
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

