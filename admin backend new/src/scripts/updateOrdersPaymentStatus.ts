import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order';

dotenv.config();

const updateOrdersPaymentStatus = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-admin');
    console.log('✅ Connected to MongoDB');

    // Find all orders
    const orders = await Order.find({});
    console.log(`📦 Found ${orders.length} orders to update`);

    let updatedCount = 0;
    let fixedPaymentMethodCount = 0;

    for (const order of orders) {
      let needsUpdate = false;

      // Force update paymentStatus to paid for all orders
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        needsUpdate = true;
      }

      // Fix invalid paymentMethod (like 'cod')
      const validPaymentMethods: ('Credit Card' | 'Debit Card' | 'Net Banking' | 'UPI')[] = ['Credit Card', 'Debit Card', 'Net Banking', 'UPI'];
      if (order.paymentMethod && !validPaymentMethods.includes(order.paymentMethod as any)) {
        // Map invalid methods to valid ones
        const methodMap: Record<string, 'Credit Card' | 'Debit Card' | 'Net Banking' | 'UPI'> = {
          'card': 'Credit Card',
          'Credit Card': 'Credit Card',
          'Debit Card': 'Debit Card',
          'upi': 'UPI',
          'UPI': 'UPI',
          'bank_transfer': 'Net Banking',
          'wallet': 'UPI',
          'cod': 'Credit Card', // Map COD to Credit Card
        };
        order.paymentMethod = (methodMap[order.paymentMethod] || 'Credit Card') as any;
        fixedPaymentMethodCount++;
        needsUpdate = true;
      }

      // If paymentMethod is missing, set default
      if (!order.paymentMethod) {
        order.paymentMethod = 'Credit Card' as any;
        needsUpdate = true;
      }

      if (needsUpdate) {
        // Use updateOne to avoid validation issues, then save
        try {
          await order.save();
          updatedCount++;
          console.log(`✅ Updated order ${order.orderNumber}`);
        } catch (error: any) {
          console.error(`❌ Error updating order ${order.orderNumber}:`, error.message);
          // Try direct update if save fails
          try {
            await Order.updateOne(
              { _id: order._id },
              {
                $set: {
                  paymentStatus: 'paid',
                  paymentMethod: order.paymentMethod || 'Credit Card',
                },
              }
            );
            updatedCount++;
            console.log(`✅ Updated order ${order.orderNumber} (direct update)`);
          } catch (updateError: any) {
            console.error(`❌ Failed to update order ${order.orderNumber}:`, updateError.message);
          }
        }
      }
    }

    console.log('\n✅ Payment status update completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Summary:`);
    console.log(`   Total orders: ${orders.length}`);
    console.log(`   Updated orders: ${updatedCount}`);
    console.log(`   Fixed payment methods: ${fixedPaymentMethodCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error updating orders:', error.message);
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

updateOrdersPaymentStatus();

