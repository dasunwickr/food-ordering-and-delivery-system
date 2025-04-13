import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurantApplication extends Document {
  ownerName:String,
  restaurentName: string;
  phoneNumber: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const restaurantApplicationSchema = new Schema<IRestaurantApplication>({

    ownerName:{ type: String, required: true },
    restaurentName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const RestaurantApplicationModel = mongoose.model<IRestaurantApplication>('RestaurantApplication', restaurantApplicationSchema);