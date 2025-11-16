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

    // Sample dummy data
    const dummyOrders = [
      {
        number: generateOrderNumber(),
        user: new mongoose.Types.ObjectId(),
        customer: {
          email: 'customer1@example.com',
          phone: '+91 9876543210',
          firstName: 'Raj',
          lastName: 'Kumar'
        },
        status: 'pending',
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
          },
          // Legacy fields
          price: 150000,
          total: 150000
        }],
        shippingAddress: {
          name: 'Raj Kumar',
          phone: '+91 9876543210',
          line1: '123 MG Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India',
          street: '123 MG Road',
          zipCode: '400001'
        },
        billingAddress: {
          name: 'Raj Kumar',
          phone: '+91 9876543210',
          line1: '123 MG Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India',
          street: '123 MG Road',
          zipCode: '400001'
        },
        pricing: {
          currency: 'INR',
          subtotal: 150000,
          discount: 0,
          shipping: 500,
          tax: 15000,
          total: 165500
        },
        subtotal: 150000,
        gst: 15000,
        shippingCharge: 500,
        totalAmount: 165500,
        payment: {
          method: 'card',
          status: 'paid',
          transactionId: 'TXN_001',
          paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        paymentMethod: 'Credit Card',
        paymentStatus: 'paid',
        transactionId: 'TXN_001',
        shipping: {
          method: 'standard',
          carrier: 'BlueDart'
        },
        orderedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        number: generateOrderNumber(),
        user: new mongoose.Types.ObjectId(),
        customer: {
          email: 'customer2@example.com',
          phone: '+91 9876543211',
          firstName: 'Priya',
          lastName: 'Sharma'
        },
        status: 'confirmed',
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
          },
          price: 45000,
          total: 45000
        }],
        shippingAddress: {
          name: 'Priya Sharma',
          phone: '+91 9876543211',
          line1: '456 Park Street',
          city: 'Delhi',
          state: 'Delhi',
          postalCode: '110001',
          country: 'India',
          street: '456 Park Street',
          zipCode: '110001'
        },
        billingAddress: {
          name: 'Priya Sharma',
          phone: '+91 9876543211',
          line1: '456 Park Street',
          city: 'Delhi',
          state: 'Delhi',
          postalCode: '110001',
          country: 'India',
          street: '456 Park Street',
          zipCode: '110001'
        },
        pricing: {
          currency: 'INR',
          subtotal: 45000,
          discount: 2000,
          shipping: 500,
          tax: 4500,
          total: 48000
        },
        subtotal: 45000,
        gst: 4500,
        shippingCharge: 500,
        totalAmount: 48000,
        payment: {
          method: 'upi',
          status: 'paid',
          transactionId: 'TXN_002',
          paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        paymentMethod: 'UPI',
        paymentStatus: 'paid',
        transactionId: 'TXN_002',
        shipping: {
          method: 'express',
          carrier: 'FedEx'
        },
        orderedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        number: generateOrderNumber(),
        user: new mongoose.Types.ObjectId(),
        customer: {
          email: 'customer3@example.com',
          phone: '+91 9876543212',
          firstName: 'Amit',
          lastName: 'Patel'
        },
        status: 'shipped',
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
          },
          price: 180000,
          total: 180000
        }],
        shippingAddress: {
          name: 'Amit Patel',
          phone: '+91 9876543212',
          line1: '789 Commercial Street',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India',
          street: '789 Commercial Street',
          zipCode: '560001'
        },
        billingAddress: {
          name: 'Amit Patel',
          phone: '+91 9876543212',
          line1: '789 Commercial Street',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India',
          street: '789 Commercial Street',
          zipCode: '560001'
        },
        pricing: {
          currency: 'INR',
          subtotal: 180000,
          discount: 0,
          shipping: 1000,
          tax: 18000,
          total: 199000
        },
        subtotal: 180000,
        gst: 18000,
        shippingCharge: 1000,
        totalAmount: 199000,
        payment: {
          method: 'card',
          status: 'paid',
          transactionId: 'TXN_003',
          paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        paymentMethod: 'Credit Card',
        paymentStatus: 'paid',
        transactionId: 'TXN_003',
        shipping: {
          method: 'standard',
          carrier: 'BlueDart',
          trackingNumber: 'BD123456789',
          shippedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        trackingNumber: 'BD123456789',
        courierService: 'BlueDart',
        orderedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        shippedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        number: generateOrderNumber(),
        user: new mongoose.Types.ObjectId(),
        customer: {
          email: 'customer4@example.com',
          phone: '+91 9876543213',
          firstName: 'Sneha',
          lastName: 'Joshi'
        },
        status: 'delivered',
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
          },
          price: 75000,
          total: 75000
        }],
        shippingAddress: {
          name: 'Sneha Joshi',
          phone: '+91 9876543213',
          line1: '321 Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500033',
          country: 'India',
          street: '321 Jubilee Hills',
          zipCode: '500033'
        },
        billingAddress: {
          name: 'Sneha Joshi',
          phone: '+91 9876543213',
          line1: '321 Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500033',
          country: 'India',
          street: '321 Jubilee Hills',
          zipCode: '500033'
        },
        pricing: {
          currency: 'INR',
          subtotal: 75000,
          discount: 5000,
          shipping: 500,
          tax: 7500,
          total: 78000
        },
        subtotal: 75000,
        gst: 7500,
        shippingCharge: 500,
        totalAmount: 78000,
        payment: {
          method: 'card',
          status: 'paid',
          transactionId: 'TXN_004',
          paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        paymentMethod: 'Credit Card',
        paymentStatus: 'paid',
        transactionId: 'TXN_004',
        shipping: {
          method: 'standard',
          carrier: 'BlueDart',
          trackingNumber: 'BD987654321',
          shippedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        },
        trackingNumber: 'BD987654321',
        courierService: 'BlueDart',
        orderedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        shippedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        number: generateOrderNumber(),
        user: new mongoose.Types.ObjectId(),
        customer: {
          email: 'customer5@example.com',
          phone: '+91 9876543214',
          firstName: 'Vikram',
          lastName: 'Singh'
        },
        status: 'in_production',
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
          },
          price: 120000,
          total: 120000
        }],
        shippingAddress: {
          name: 'Vikram Singh',
          phone: '+91 9876543214',
          line1: '654 MG Road',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411001',
          country: 'India',
          street: '654 MG Road',
          zipCode: '411001'
        },
        billingAddress: {
          name: 'Vikram Singh',
          phone: '+91 9876543214',
          line1: '654 MG Road',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411001',
          country: 'India',
          street: '654 MG Road',
          zipCode: '411001'
        },
        pricing: {
          currency: 'INR',
          subtotal: 120000,
          discount: 0,
          shipping: 1000,
          tax: 12000,
          total: 133000
        },
        subtotal: 120000,
        gst: 12000,
        shippingCharge: 1000,
        totalAmount: 133000,
        payment: {
          method: 'bank_transfer',
          status: 'paid',
          transactionId: 'TXN_005',
          paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        paymentMethod: 'Net Banking',
        paymentStatus: 'paid',
        transactionId: 'TXN_005',
        shipping: {
          method: 'standard',
          carrier: 'BlueDart'
        },
        orderedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        estimatedDeliveryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      }
    ];

    console.log('🌱 Seeding orders...');
    const created = await Order.insertMany(dummyOrders);

    console.log('\n✅ Orders seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Seeded Orders:');
    created.forEach((order) => {
      console.log(`   ${order.number}: ${order.items[0]?.name || 'N/A'} - Status: ${order.status}, Amount: ₹${order.totalAmount}`);
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

