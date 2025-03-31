import mongoose, { Document, Schema } from "mongoose";

export interface IDelivery extends Document {
  orderId: string;
  driverId?: string;
  status: string;
  acceptedAt: Date;
  deliveredAt: Date;
}

const deliverySchema: Schema = new Schema(
  {
    orderId: { type: String, required: true },
    driverId: { type: String, required: false },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "ACCEPTED", "IN_PROGRESS", "DELIVERED", "CANCELLED"],
    },
    acceptedAt: { type: Date, required: true },
    deliveredAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const Delivery = mongoose.model<IDelivery>("Delivery", deliverySchema);

export default Delivery;
