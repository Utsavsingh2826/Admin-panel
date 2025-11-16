import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CustomizationRequest, { CustomizationStatus } from '../models/CustomizationRequest';

dotenv.config();

const seedCustomizationRequests = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-admin');
    console.log('✅ Connected to MongoDB');

    // Clear existing customization requests
    console.log('🗑️  Clearing existing customization requests...');
    await CustomizationRequest.deleteMany({});
    console.log('✅ Existing requests cleared');

    // Helper function to generate unique request IDs
    let counter = 0;
    const generateRequestId = () => `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generateRequestNumber = () => {
      counter++;
      return `KYNA-REQ-${Date.now().toString().slice(-8)}-${counter.toString().padStart(3, '0')}`;
    };

    // Sample dummy data
    const dummyRequests = [
      {
        requestId: generateRequestId(),
        requestNumber: generateRequestNumber(),
        userId: 'user123',
        title: 'Custom Diamond Engagement Ring',
        description: 'I want a custom engagement ring with a round diamond center stone, surrounded by smaller diamonds. The ring should be in 18K white gold with a classic solitaire design.',
        category: 'RINGS',
        subCategory: "Women's Rings",
        jewelryType: 'Ring',
        stylingName: 'CLASSIC',
        referenceImages: [
          'https://res.cloudinary.com/djcdk3pi4/image/upload/v1234567890/sample-ring-1.jpg',
          'https://res.cloudinary.com/djcdk3pi4/image/upload/v1234567890/sample-ring-2.jpg'
        ],
        inspirationImages: [],
        designImages: [
          'https://res.cloudinary.com/djcdk3pi4/image/upload/v1234567890/design-1.jpg'
        ],
        diamondShape: 'round',
        diamondSize: '1.5',
        diamondColor: 'D',
        diamondClarity: 'VVS1',
        diamondOrigin: 'Natural',
        metalType: 'Gold',
        metalKarat: '18K',
        metalColor: 'White',
        ringSize: '6',
        dimensions: {
          width: 8,
          height: 6,
          depth: 4
        },
        engraving: {
          text: 'Forever & Always',
          font: 'Script',
          position: 'inside band'
        },
        specialInstructions: 'Please ensure the diamond is certified by GIA. I prefer a high polish finish.',
        budgetRange: {
          min: 150000,
          max: 200000
        },
        contactInfo: {
          firstName: 'Rajesh',
          lastName: 'Kumar',
          email: 'rajesh.kumar@example.com',
          phoneNumber: '+91 9876543210',
          address: '123 MG Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        estimatedPrice: 175000,
        finalPrice: 180000,
        priceBreakdown: {
          basePrice: 120000,
          diamondPrice: 45000,
          metalPrice: 8000,
          customizationFee: 5000,
          engravingFee: 2000,
          gst: 18000,
          total: 180000
        },
        status: CustomizationStatus.APPROVED,
        partialPaymentStatus: CustomizationStatus.COMPLETED,
        progress: 75,
        messages: [
          {
            sender: 'user',
            message: 'I would like to see the 3D design before finalizing.',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            sender: 'admin',
            message: 'We have completed the 3D design. Please review and confirm.',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ],
        adminNotes: 'Customer has approved the design. Ready for order processing.',
        requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        estimatedDeliveryDay: 'Within 30 days',
        tags: ['engagement', 'diamond', 'custom']
      },
      {
        requestId: generateRequestId(),
        requestNumber: generateRequestNumber(),
        userId: 'user456',
        title: 'Platinum Wedding Band with Engraving',
        description: 'A simple yet elegant platinum wedding band with custom engraving. I want it to be 5mm wide with a brushed finish.',
        category: 'RINGS',
        subCategory: "Men's Rings",
        jewelryType: 'Ring',
        stylingName: 'CLASSIC',
        referenceImages: [
          'https://res.cloudinary.com/djcdk3pi4/image/upload/v1234567890/wedding-band-1.jpg'
        ],
        inspirationImages: [],
        designImages: [
          'https://res.cloudinary.com/djcdk3pi4/image/upload/v1234567890/design-2.jpg'
        ],
        metalType: 'Platinum',
        metalKarat: '950',
        metalColor: 'White',
        ringSize: '10',
        dimensions: {
          width: 5,
          height: 2,
          depth: 2
        },
        engraving: {
          text: 'Together Forever',
          font: 'Modern',
          position: 'inside band'
        },
        specialInstructions: 'Please use brushed finish, not polished.',
        budgetRange: {
          min: 50000,
          max: 70000
        },
        contactInfo: {
          firstName: 'Priya',
          lastName: 'Sharma',
          email: 'priya.sharma@example.com',
          phoneNumber: '+91 9876543211',
          address: '456 Park Street',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        },
        estimatedPrice: 60000,
        finalPrice: 62000,
        priceBreakdown: {
          basePrice: 45000,
          diamondPrice: 0,
          metalPrice: 12000,
          customizationFee: 3000,
          engravingFee: 2000,
          gst: 6000,
          total: 62000
        },
        status: CustomizationStatus.IN_PROGRESS,
        partialPaymentStatus: CustomizationStatus.COMPLETED,
        progress: 50,
        messages: [
          {
            sender: 'user',
            message: 'When will the design be ready?',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        ],
        adminNotes: 'Design approved. Partial payment received.',
        requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        estimatedDeliveryDay: 'Within 25 days',
        tags: ['wedding', 'platinum', 'men']
      },
      {
        requestId: generateRequestId(),
        requestNumber: generateRequestNumber(),
        userId: 'user789',
        title: 'Custom Diamond Earrings',
        description: 'I want a pair of custom diamond stud earrings. Each earring should have a 0.5 carat round diamond in 18K yellow gold setting.',
        category: 'EARRINGS',
        subCategory: "Women's Earrings",
        jewelryType: 'Earrings',
        stylingName: 'CLASSIC',
        referenceImages: [
          'https://res.cloudinary.com/djcdk3pi4/image/upload/v1234567890/earrings-1.jpg'
        ],
        inspirationImages: [],
        designImages: [
          'https://res.cloudinary.com/djcdk3pi4/image/upload/v1234567890/design-3.jpg'
        ],
        diamondShape: 'round',
        diamondSize: '0.5',
        diamondColor: 'F',
        diamondClarity: 'VS1',
        diamondOrigin: 'Lab Grown',
        metalType: 'Gold',
        metalKarat: '18K',
        metalColor: 'Yellow',
        specialInstructions: 'Please ensure both diamonds match in color and clarity.',
        budgetRange: {
          min: 80000,
          max: 100000
        },
        contactInfo: {
          firstName: 'Anjali',
          lastName: 'Patel',
          email: 'anjali.patel@example.com',
          phoneNumber: '+91 9876543212',
          address: '789 Commercial Street',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        },
        estimatedPrice: 90000,
        finalPrice: 95000,
        priceBreakdown: {
          basePrice: 60000,
          diamondPrice: 25000,
          metalPrice: 5000,
          customizationFee: 3000,
          engravingFee: 0,
          gst: 9000,
          total: 95000
        },
        status: CustomizationStatus.APPROVED,
        partialPaymentStatus: CustomizationStatus.COMPLETED,
        progress: 60,
        messages: [
          {
            sender: 'user',
            message: 'Can I see the design before making the final payment?',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          },
          {
            sender: 'admin',
            message: 'Yes, we have sent the 3D design. Please review.',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ],
        adminNotes: 'Customer has reviewed the design. Partial payment completed.',
        requestedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        estimatedDeliveryDay: 'Within 28 days',
        tags: ['earrings', 'diamond', 'stud']
      },
      {
        requestId: generateRequestId(),
        requestNumber: generateRequestNumber(),
        userId: 'user321',
        title: 'Custom Gold Bracelet',
        description: 'A custom gold bracelet with nature-inspired design. I want leaves and flowers pattern engraved on it.',
        category: 'BRACELETS',
        subCategory: "Women's Bracelets",
        jewelryType: 'Bracelet',
        stylingName: 'NATURE INSPIRED',
        referenceImages: [
          'https://res.cloudinary.com/djcdk3pi4/image/upload/v1234567890/bracelet-1.jpg'
        ],
        inspirationImages: [
          'https://res.cloudinary.com/djcdk3pi4/image/upload/v1234567890/inspiration-1.jpg'
        ],
        designImages: [],
        metalType: 'Gold',
        metalKarat: '22K',
        metalColor: 'Yellow',
        dimensions: {
          width: 15,
          height: 2,
          depth: 1
        },
        specialInstructions: 'The pattern should be delicate and elegant.',
        budgetRange: {
          min: 120000,
          max: 150000
        },
        contactInfo: {
          firstName: 'Meera',
          lastName: 'Reddy',
          email: 'meera.reddy@example.com',
          phoneNumber: '+91 9876543213',
          address: '321 Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500033',
          country: 'India'
        },
        estimatedPrice: 135000,
        finalPrice: 140000,
        priceBreakdown: {
          basePrice: 100000,
          diamondPrice: 0,
          metalPrice: 25000,
          customizationFee: 10000,
          engravingFee: 5000,
          gst: 14000,
          total: 140000
        },
        status: CustomizationStatus.IN_REVIEW,
        partialPaymentStatus: CustomizationStatus.COMPLETED,
        progress: 25,
        messages: [
          {
            sender: 'user',
            message: 'I love the nature theme. Can you make it more detailed?',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ],
        adminNotes: 'Design in progress. Customer wants more detailed pattern.',
        requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        estimatedDeliveryDay: 'Within 35 days',
        tags: ['bracelet', 'gold', 'nature']
      },
      {
        requestId: generateRequestId(),
        requestNumber: generateRequestNumber(),
        userId: 'user654',
        title: 'Custom Pendant with Initial',
        description: 'A custom pendant with my initial "S" in 18K rose gold with small diamonds around the letter.',
        category: 'PENDANTS',
        subCategory: "Women's Pendants",
        jewelryType: 'Pendant',
        stylingName: 'CUSTOM',
        referenceImages: [
          'https://res.cloudinary.com/djcdk3pi4/image/upload/v1234567890/pendant-1.jpg'
        ],
        inspirationImages: [],
        designImages: [
          'https://res.cloudinary.com/djcdk3pi4/image/upload/v1234567890/design-4.jpg'
        ],
        diamondShape: 'round',
        diamondSize: '0.1',
        diamondColor: 'G',
        diamondClarity: 'SI1',
        diamondOrigin: 'Natural',
        metalType: 'Gold',
        metalKarat: '18K',
        metalColor: 'Rose',
        specialInstructions: 'The initial should be in cursive font style.',
        budgetRange: {
          min: 40000,
          max: 60000
        },
        contactInfo: {
          firstName: 'Sneha',
          lastName: 'Joshi',
          email: 'sneha.joshi@example.com',
          phoneNumber: '+91 9876543214',
          address: '654 MG Road',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
          country: 'India'
        },
        estimatedPrice: 50000,
        finalPrice: 52000,
        priceBreakdown: {
          basePrice: 30000,
          diamondPrice: 15000,
          metalPrice: 4000,
          customizationFee: 2000,
          engravingFee: 1000,
          gst: 5000,
          total: 52000
        },
        status: CustomizationStatus.APPROVED,
        partialPaymentStatus: CustomizationStatus.COMPLETED,
        progress: 80,
        messages: [
          {
            sender: 'admin',
            message: 'Design completed. Please review and confirm.',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        adminNotes: 'Ready for order processing. Customer has approved the design.',
        requestedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        estimatedDeliveryDay: 'Within 20 days',
        tags: ['pendant', 'initial', 'rose-gold']
      }
    ];

    console.log('🌱 Seeding customization requests...');
    const created = await CustomizationRequest.insertMany(dummyRequests);

    console.log('\n✅ Customization requests seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Seeded Requests:');
    created.forEach((req) => {
      console.log(`   ${req.requestNumber}: ${req.title} - Status: ${req.status}, Partial Payment: ${req.partialPaymentStatus}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📊 Total requests created: ${created.length}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding customization requests:', error.message);
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedCustomizationRequests();

