import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DefaultValue from '../models/DefaultValue';

dotenv.config();

const seedDefaultValues = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-admin');
    console.log('✅ Connected to MongoDB');

    // Clear existing default values
    console.log('🗑️  Clearing existing default values...');
    await DefaultValue.deleteMany({});
    console.log('✅ Existing values cleared');

    // Seed data
    const defaultValues = [
      { goldValue24PerGram: 12000 },
      { silverPricePerGram: 80 },
      { platinumPricePerGram: 3200 },
      { titaniumPricePerGram: 500 },
      { labourCostGold: 2200 },
      { labourCostPlatinum: 3500 },
      { labourCostSilver: 1300 },
      { labourCostTitanium: 3500 },
      { silverExpense: 1500 },
      { goldExpense: 1500 },
      { platinumExpense: 1500 },
      { titaniumExpense: 1500 },
      { gstValue: 3 },
    ];

    console.log('🌱 Seeding default values...');
    const created = await DefaultValue.insertMany(defaultValues);

    console.log('\n✅ Default values seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Seeded Values:');
    created.forEach((doc) => {
      const docObject = doc.toObject() as any;
      const fieldName = Object.keys(docObject).find(
        (key) => key !== '_id' && key !== '__v' && docObject[key] !== undefined && docObject[key] !== null
      );
      if (fieldName) {
        console.log(`   ${fieldName}: ${docObject[fieldName]}`);
      }
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📊 Total documents created: ${created.length}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding default values:', error.message);
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDefaultValues();

