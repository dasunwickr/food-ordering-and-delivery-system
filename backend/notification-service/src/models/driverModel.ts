import mongoose, { Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  driverId: string; // Unique identifier for the driver
  name: string; // Driver's name
  phoneNumber: string; // Driver's phone number
  email: string; // Driver's email
  orderId: string; // Order ID assigned to the driver
  status: 'allocated' | 'in-progress' | 'delivered' | 'Order Preparation Completed'; // Delivery status
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<IDriver>({
  driverId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  orderId: { type: String, required: true },
  status: { type: String, enum: ['allocated', 'in-progress', 'delivered','Order Preparation Completed'], default: 'allocated' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const DriverModel = mongoose.model<IDriver>('Driver', driverSchema);