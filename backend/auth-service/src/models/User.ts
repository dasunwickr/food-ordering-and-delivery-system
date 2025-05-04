import mongoose from 'mongoose';

// Define valid user types
const USER_TYPES = ['admin', 'customer', 'driver', 'restaurant'] as const;
type UserType = typeof USER_TYPES[number];

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // No longer required because Google users won't have a password
  userType: { 
    type: String, 
    required: true,
    enum: USER_TYPES,
    set: (v: string) => v.toLowerCase()
  },
  // Add Google-specific fields
  googleId: { type: String, sparse: true, unique: true },
  authProvider: { 
    type: String, 
    enum: ['local', 'google'], 
    default: 'local' 
  },
}, { timestamps: true });

// Create a compound index to ensure uniqueness by provider 
// This allows same email to be used with different providers
userSchema.index({ email: 1, authProvider: 1 }, { unique: true });

export const UserModel = mongoose.model('User', userSchema);