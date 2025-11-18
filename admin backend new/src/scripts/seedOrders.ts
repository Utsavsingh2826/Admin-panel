import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order';

dotenv.config();

const seedOrders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-admin');
    console.log('✅ Connected to MongoDB');

    // Clear existing orders
    console.log('🗑️  Clearing existing orders...');
    await Order.deleteMany({});
    console.log('✅ Existing orders cleared');

    // Helper function to generate order numbers
    let orderCounter = 0;
    const generateOrderNumber = () => {
      orderCounter++;
      return `ORD-${Date.now()}-${orderCounter.toString().padStart(4, '0')}`;
    };

    // Helper to get timestamp (days ago)
    const daysAgo = (days: number) => Date.now() - (days * 24 * 60 * 60 * 1000);

    // Sample dummy data - using new schema format directly
    const dummyOrders = [
      {
        orderNumber: generateOrderNumber(),
        user: new mongoose.Types.ObjectId(),
        orderStatus: 'pending',
        orderType: 'normal',
        items: [{
          lineId: 'LINE_001',
          name: 'Diamond Solitaire Ring',
          productType: 'ring',
          category: 'rings',
          category1: 'solitaire',
          category2: 'women',
          category3: '',
          centerStoneShape: 'round',
          quantity: 1,
          unitPrice: {
            currency: 'INR',
            amount: 150000
          },
          metal: {
            material: 'gold',
            color: 'white',
            karat: '18K'
          },
          centerStone: {
            type: 'natural diamond',
            shape: 'round',
            carat: 1.0,
            color: 'D',
            clarity: 'VVS1'
          },
          dimensions: {
            ringSize: '6'
          },
          lineTotals: {
            subtotal: {
              currency: 'INR',
              amount: 150000
            },
            total: {
              currency: 'INR',
              amount: 150000
            }
          }
        }],
        shippingAddress: {
          street: '123 MG Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          sameAsBilling: true
        },
        billingAddress: {
          street: '123 MG Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          sameAsBilling: true
        },
        subtotal: 150000,
        gst: 15000,
        shippingCharge: 500,
        totalAmount: 165500,
        paymentMethod: 'Credit Card',
        paymentStatus: 'paid',
        transactionId: 'TXN_001',
        statusHistory: [{
          status: 'pending',
          date: daysAgo(2),
          note: 'Order placed'
        }],
        orderedAt: daysAgo(2),
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2)
      },
      {
        orderNumber: generateOrderNumber(),
        user: new mongoose.Types.ObjectId(),
        orderStatus: 'processing',
        orderType: 'normal',
        items: [{
          lineId: 'LINE_002',
          name: 'Gold Earrings',
          productType: 'earrings',
          category: 'earrings',
          category1: 'studs',
          category2: 'women',
          category3: '',
          centerStoneShape: 'round',
          quantity: 1,
          unitPrice: {
            currency: 'INR',
            amount: 45000
          },
          metal: {
            material: 'gold',
            color: 'yellow',
            karat: '22K'
          },
          centerStone: {
            type: 'natural diamond',
            shape: 'round',
            carat: 0.5,
            color: 'F',
            clarity: 'VS1'
          },
          dimensions: {
            earringSubtype: 'studs'
          },
          lineTotals: {
            subtotal: {
              currency: 'INR',
              amount: 45000
            },
            total: {
              currency: 'INR',
              amount: 45000
            }
          }
        }],
        shippingAddress: {
          street: '456 Park Street',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India',
          sameAsBilling: true
        },
        billingAddress: {
          street: '456 Park Street',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India',
          sameAsBilling: true
        },
        subtotal: 45000,
        gst: 4500,
        shippingCharge: 500,
        totalAmount: 48000,
        paymentMethod: 'UPI',
        paymentStatus: 'paid',
        transactionId: 'TXN_002',
        statusHistory: [
          {
            status: 'pending',
            date: daysAgo(5),
            note: 'Order placed'
          },
          {
            status: 'processing',
            date: daysAgo(4),
            note: 'Order confirmed and in production'
          }
        ],
        orderedAt: daysAgo(5),
        createdAt: daysAgo(5),
        updatedAt: daysAgo(4)
      },
      {
        orderNumber: generateOrderNumber(),
        user: new mongoose.Types.ObjectId(),
        orderStatus: 'shipped',
        orderType: 'customized',
        items: [{
          lineId: 'LINE_003',
          name: 'Custom Platinum Ring',
          productType: 'ring',
          category: 'rings',
          category1: 'custom',
          category2: 'men',
          category3: '',
          centerStoneShape: 'round',
          quantity: 1,
          unitPrice: {
            currency: 'INR',
            amount: 180000
          },
          metal: {
            material: 'platinum',
            color: 'white',
            karat: '950'
          },
          centerStone: {
            type: 'natural diamond',
            shape: 'round',
            carat: 1.2,
            color: 'E',
            clarity: 'VVS2'
          },
          dimensions: {
            ringSize: '10'
          },
          customization: {
            engraving: {
              text: 'Forever',
              font: 'Script',
              position: 'inside band'
            },
            notes: 'Custom design approved by customer'
          },
          lineTotals: {
            subtotal: {
              currency: 'INR',
              amount: 180000
            },
            total: {
              currency: 'INR',
              amount: 180000
            }
          }
        }],
        shippingAddress: {
          street: '789 Commercial Street',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
          sameAsBilling: true
        },
        billingAddress: {
          street: '789 Commercial Street',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
          sameAsBilling: true
        },
        subtotal: 180000,
        gst: 18000,
        shippingCharge: 1000,
        totalAmount: 199000,
        paymentMethod: 'Credit Card',
        paymentStatus: 'paid',
        transactionId: 'TXN_003',
        trackingInfo: {
          events: [{
            docketNumber: 'BD123456789',
            status: 'shipped',
            date: daysAgo(3),
            carrier: 'BlueDart',
            service: 'standard',
            note: 'Order shipped via BlueDart'
          }],
          trackingHistory: [{
            docketNumber: 'BD123456789',
            status: 'shipped',
            date: daysAgo(3),
            carrier: 'BlueDart',
            service: 'standard',
            note: 'Order shipped via BlueDart'
          }]
        },
        statusHistory: [
          {
            status: 'pending',
            date: daysAgo(10),
            note: 'Order placed'
          },
          {
            status: 'processing',
            date: daysAgo(9),
            note: 'Order confirmed'
          },
          {
            status: 'shipped',
            date: daysAgo(3),
            note: 'Order shipped via BlueDart'
          }
        ],
        orderedAt: daysAgo(10),
        createdAt: daysAgo(10),
        updatedAt: daysAgo(3)
      },
      {
        orderNumber: generateOrderNumber(),
        user: new mongoose.Types.ObjectId(),
        orderStatus: 'delivered',
        orderType: 'normal',
        items: [{
          lineId: 'LINE_004',
          name: 'Diamond Pendant',
          productType: 'pendant',
          category: 'pendants',
          category1: 'solitaire',
          category2: 'women',
          category3: '',
          centerStoneShape: 'round',
          quantity: 1,
          unitPrice: {
            currency: 'INR',
            amount: 75000
          },
          metal: {
            material: 'gold',
            color: 'rose',
            karat: '18K'
          },
          centerStone: {
            type: 'natural diamond',
            shape: 'round',
            carat: 0.75,
            color: 'F',
            clarity: 'VS1'
          },
          lineTotals: {
            subtotal: {
              currency: 'INR',
              amount: 75000
            },
            total: {
              currency: 'INR',
              amount: 75000
            }
          }
        }],
        shippingAddress: {
          street: '321 Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500033',
          country: 'India',
          sameAsBilling: true
        },
        billingAddress: {
          street: '321 Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500033',
          country: 'India',
          sameAsBilling: true
        },
        subtotal: 75000,
        gst: 7500,
        shippingCharge: 500,
        totalAmount: 78000,
        paymentMethod: 'Credit Card',
        paymentStatus: 'paid',
        transactionId: 'TXN_004',
        trackingInfo: {
          events: [
            {
              docketNumber: 'BD987654321',
              status: 'shipped',
              date: daysAgo(12),
              carrier: 'BlueDart',
              service: 'standard',
              note: 'Order shipped via BlueDart'
            },
            {
              docketNumber: 'BD987654321',
              status: 'delivered',
              date: daysAgo(8),
              carrier: 'BlueDart',
              service: 'standard',
              note: 'Order delivered successfully'
            }
          ],
          trackingHistory: [
            {
              docketNumber: 'BD987654321',
              status: 'shipped',
              date: daysAgo(12),
              carrier: 'BlueDart',
              service: 'standard',
              note: 'Order shipped via BlueDart'
            },
            {
              docketNumber: 'BD987654321',
              status: 'delivered',
              date: daysAgo(8),
              carrier: 'BlueDart',
              service: 'standard',
              note: 'Order delivered successfully'
            }
          ]
        },
        statusHistory: [
          {
            status: 'pending',
            date: daysAgo(15),
            note: 'Order placed'
          },
          {
            status: 'processing',
            date: daysAgo(14),
            note: 'Order confirmed'
          },
          {
            status: 'shipped',
            date: daysAgo(12),
            note: 'Order shipped via BlueDart'
          },
          {
            status: 'delivered',
            date: daysAgo(8),
            note: 'Order delivered successfully'
          }
        ],
        orderedAt: daysAgo(15),
        createdAt: daysAgo(15),
        updatedAt: daysAgo(8)
      },
      {
        orderNumber: generateOrderNumber(),
        user: new mongoose.Types.ObjectId(),
        orderStatus: 'processing',
        orderType: 'customized',
        items: [{
          lineId: 'LINE_005',
          name: 'Custom Gold Bracelet',
          productType: 'bracelet',
          category: 'bracelets',
          category1: 'custom',
          category2: 'women',
          category3: '',
          centerStoneShape: '',
          quantity: 1,
          unitPrice: {
            currency: 'INR',
            amount: 120000
          },
          metal: {
            material: 'gold',
            color: 'yellow',
            karat: '22K'
          },
          dimensions: {
            braceletLengthMM: 180
          },
          customization: {
            notes: 'Nature-inspired design with leaf patterns'
          },
          lineTotals: {
            subtotal: {
              currency: 'INR',
              amount: 120000
            },
            total: {
              currency: 'INR',
              amount: 120000
            }
          }
        }],
        shippingAddress: {
          street: '654 MG Road',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
          country: 'India',
          sameAsBilling: true
        },
        billingAddress: {
          street: '654 MG Road',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
          country: 'India',
          sameAsBilling: true
        },
        subtotal: 120000,
        gst: 12000,
        shippingCharge: 1000,
        totalAmount: 133000,
        paymentMethod: 'Net Banking',
        paymentStatus: 'paid',
        transactionId: 'TXN_005',
        statusHistory: [
          {
            status: 'pending',
            date: daysAgo(7),
            note: 'Order placed'
          },
          {
            status: 'processing',
            date: daysAgo(6),
            note: 'Order confirmed and in production'
          }
        ],
        orderedAt: daysAgo(7),
        createdAt: daysAgo(7),
        updatedAt: daysAgo(6)
      }
    ];

    console.log('🌱 Seeding orders...');
    const created = await Order.insertMany(dummyOrders);

    console.log('\n✅ Orders seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Seeded Orders:');
    created.forEach((order) => {
      console.log(`   ${order.orderNumber}: ${order.items[0]?.name || 'N/A'} - Status: ${order.orderStatus}, Amount: ₹${order.totalAmount}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📊 Total orders created: ${created.length}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding orders:', error.message);
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedOrders();
