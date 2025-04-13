import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  userId: string;
  phoneNumber: string;
  email:string,
  restuarantMail: string | null; // Optional field
  status: 'confirmed' | 'preperation completed' | 'out-for-delivery' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  phoneNumber: { type: String, required: true }, 
  email:{type:String,required:true},
  restuarantMail: { type: String, required: false, default: null }, // Optional field
  status: {
    type: String,
    enum: ['confirmed', 'preperation completed', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'confirmed',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const OrderModel = mongoose.model<IOrder>('Order', orderSchema);