import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const AddressSchema = new Schema(
  {
    shippingAddress: {
      sameAsBilling: {
        type: Boolean,
        default: false,
      },
    },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    name: String,
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: 'customer',
    },
    address: AddressSchema,
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    gifts: Array,
    isActive: {
      type: Boolean,
      default: true,
    },
    availableOffers: {
      type: Number,
      default: 0,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    refDiscount: {
      type: Number,
      default: 0,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    totalReferralEarnings: {
      type: Number,
      default: 0,
    },
    usedPromoCodes: Array,
    usedReferralCodes: Array,
    lastLogin: Number,
    referralCode: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

const DummyUserModel =
  mongoose.models.DummySeedUser || mongoose.model('DummySeedUser', UserSchema, 'users');

const SAMPLE_PASSWORD = 'Password@123';
const SAMPLE_DOMAINS = ['auroragems.com', 'lumina.io', 'stellarjewelers.in', 'sparkle.store'];
const ROLES = ['customer', 'customer', 'customer', 'manager', 'customer', 'staff'];

const generateReferralCode = (firstName: string, lastName: string, index: number) =>
  `${firstName.substring(0, 2).toUpperCase()}${lastName.substring(0, 2).toUpperCase()}${1000 + index}`;

const buildDummyUsers = (count: number) => {
  const firstNames = [
    'Aarav',
    'Meera',
    'Karan',
    'Isha',
    'Vihaan',
    'Diya',
    'Rohan',
    'Anika',
    'Kabir',
    'Sara',
  ];
  const lastNames = [
    'Sharma',
    'Patel',
    'Mehta',
    'Nair',
    'Gupta',
    'Rao',
    'Kapoor',
    'Iyer',
    'Agarwal',
    'Bose',
  ];

  return Array.from({ length: count }).map((_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[(index * 3) % lastNames.length];
    const emailDomain = SAMPLE_DOMAINS[index % SAMPLE_DOMAINS.length];
    const email = `${firstName}.${lastName}${index + 1}@${emailDomain}`.toLowerCase();

    return {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      password: SAMPLE_PASSWORD,
      isVerified: index % 2 === 0,
      role: ROLES[index % ROLES.length] || 'customer',
      address: {
        shippingAddress: {
          sameAsBilling: index % 3 === 0,
        },
      },
      orders: [],
      wishlist: [],
      gifts: [],
      isActive: index % 7 !== 0,
      availableOffers: (index % 4) * 2,
      referredBy: null,
      refDiscount: (index % 3) * 5,
      referralCount: index % 5,
      totalReferralEarnings: (index % 5) * 250,
      usedPromoCodes: [],
      usedReferralCodes: [],
      lastLogin: Date.now() - index * 86400000,
      referralCode: generateReferralCode(firstName, lastName, index + 1),
    };
  });
};

const seedDummyUsers = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-admin';
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB');

    const seedEmailsRegex = SAMPLE_DOMAINS.map((domain) => `@${domain.replace('.', '\\.')}$`);
    await DummyUserModel.deleteMany({
      email: { $regex: new RegExp(`(${seedEmailsRegex.join('|')})`, 'i') },
    });
    console.log('🧹 Cleared existing dummy users');

    const dummyUsers = buildDummyUsers(12);
    await DummyUserModel.insertMany(dummyUsers);

    console.log(`✨ Inserted ${dummyUsers.length} dummy users`);
    dummyUsers.forEach((user, idx) => {
      console.log(
        `${idx + 1}. ${user.name} | ${user.email} | role: ${user.role} | referral: ${user.referralCode}`
      );
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding dummy users:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDummyUsers();



