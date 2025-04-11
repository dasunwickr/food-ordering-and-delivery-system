import mongoose from 'mongoose';

const connectToDatabase = async () => {
    await mongoose.connect(process.env.MONGO_URI || '', { dbName: 'nomnom-auth' });
    console.log('MongoDB connected');
};

export default connectToDatabase;