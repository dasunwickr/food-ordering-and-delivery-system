import mongoose, { Document, Schema } from "mongoose";

// Core delivery interface without Document inheritance
export interface IDeliveryData {
  _id?: string | mongoose.Types.ObjectId; // Allow both string and ObjectId
  orderId: string;
  driverId?: string;
  status: string;
  acceptedAt?: Date;
  deliveredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Omit _id from IDeliveryData to avoid conflict with Document's _id
export interface IDelivery extends Omit<Document, '_id'>, IDeliveryData {
  // This resolves the conflict by using IDeliveryData's _id definition
}

// This schema is maintained for compatibility, but we'll be fetching
// the actual delivery data from the order-service MongoDB
const deliverySchema: Schema = new Schema(
  {
    orderId: { type: String, required: true },
    driverId: { type: String, required: false },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "ACCEPTED", "IN_PROGRESS", "DELIVERED", "CANCELLED"],
    },
    acceptedAt: { type: Date, required: false },
    deliveredAt: { type: Date, required: false },
  },
  { timestamps: true },
);

const Delivery = mongoose.model<IDelivery>("Delivery", deliverySchema);

export default Delivery;
