import mongoose from 'mongoose';

/**
 * Connect to MongoDB databases
 * We're connecting to two databases:
 * 1. delivery-service database (for backward compatibility)
 * 2. order-service database (as the source of truth for delivery data)
 */
export const connectToDatabase = async (): Promise<void> => {
  try {
    // Connect to delivery-service database for backward compatibility
    const deliveryDbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/delivery-service';
    
    await mongoose.connect(deliveryDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    } as mongoose.ConnectOptions);
    
    console.log('Successfully connected to delivery service database');
    
    // Note: Connection to order-service database is established in the Order model
    // directly using a separate connection to avoid conflicts
    
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};