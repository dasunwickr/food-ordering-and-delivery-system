import mongoose from 'mongoose';

// Define valid user types
const USER_TYPES = ['admin', 'customer', 'driver', 'restaurant'] as const;
type UserType = typeof USER_TYPES[number];

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { 
    type: String, 
    required: true,
    enum: USER_TYPES,
    set: (v: string) => v.toLowerCase()
  },
}, { timestamps: true });

export const UserModel = mongoose.model('User', userSchema);