import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  userId: string;

  status: 'confirmed' | 'preperation completed' | 'out-for-delivery' | 'delivered' |'cancelled';

  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  status: { type: String, enum: [ 'confirmed','preperation completed', 'out-for-delivery','cancelled', 'delivered'], default: 'confirmed' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const OrderModel = mongoose.model<IOrder>('Order', orderSchema);