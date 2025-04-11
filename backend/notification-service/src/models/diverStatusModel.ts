import mongoose, { Document, Schema } from 'mongoose';

export interface IDriverApplication extends Document {
  userId: string; // Unique identifier for the user applying
  name: string; // Applicant's name
  phoneNumber: string; // Applicant's phone number
  email: string; // Applicant's email
  status: 'pending' | 'approved' | 'rejected'; // Application status
  createdAt: Date;
  updatedAt: Date;
}

const driverApplicationSchema = new Schema<IDriverApplication>({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const DriverApplicationModel = mongoose.model<IDriverApplication>('DriverApplication', driverApplicationSchema);