import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-admin');
    console.log('✅ Connected to MongoDB');

    const email = 'utsavsingh2826@gmail.com';
    const password = 'Utsav@1234';

    // Check if superadmin already exists and delete it to re-seed
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('⚠️  Superadmin user already exists!');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   ID: ${existingUser._id}`);
      console.log('🗑️  Deleting existing user to re-seed with correct password hash...');
      await User.deleteOne({ _id: existingUser._id });
      console.log('✅ Existing user deleted');
    }

    // Create superadmin user (password will be hashed by User model's pre-save middleware)
    console.log('👤 Creating superadmin user...');
    const user = await User.create({
      name: 'Utsav',
      email: email.toLowerCase(),
      password: password, // Plain password - pre-save middleware will hash it
      role: 'superadmin',
      isActive: true,
      isLocked: false,
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: null,
      twoFactorCode: null,
      twoFactorCodeExpires: null,
    });

    console.log('\n✅ Superadmin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Login Credentials:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   User ID: ${user._id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Login Flow:');
    console.log('   1. Use the email and password above to login');
    console.log('   2. You will receive a 6-digit OTP code via email');
    console.log('   3. Enter the OTP code to complete login');
    console.log('\n⚠️  Note: Make sure email configuration is set up in .env file');
    console.log('   (EMAIL_HOST, EMAIL_USER, EMAIL_PASS)');
    console.log('\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating superadmin user:', error.message);
    if (error.code === 11000) {
      console.error('   User with this email already exists!');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedSuperAdmin();

