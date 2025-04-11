import mongoose, { Document } from 'mongoose';

const { Schema } = mongoose;

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    userType: string;
}

const baseOptions = {
    discriminatorKey: 'userType',
    collection: 'users',
};

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, baseOptions);

export const User = mongoose.model<IUser>('User', UserSchema);

export const Admin = User.discriminator('admin', new Schema({ roleType: String }));
export const Customer = User.discriminator('customer', new Schema({ orderHistory: [String] }));
export const Driver = User.discriminator('driver', new Schema({
    vehicleType: String,
    vehicleNumber: String,
    availabilityStatus: Boolean,
    assignedOrders: [String],
}));
export const RestaurantOwner = User.discriminator('restaurantOwner', new Schema({
    restaurantName: String,
    restaurantAddress: String,
    restaurantLicenseNumber: String,
    restaurantDocuments: String,
}));