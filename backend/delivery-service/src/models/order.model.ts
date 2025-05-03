import mongoose, { Document, Schema } from "mongoose";

export interface IDriverDetails {
  driverId: string;
  driverName: string;
  vehicleNumber: string;
  latitude?: number;
  longitude?: number;
}

export interface ICustomerDetails {
  name: string;
  contact: string;
  longitude: number;
  latitude: number;
  address?: string;
}

export interface ICartItem {
  itemId: string;
  itemName: string;
  quantity: number;
  potionSize: 'Small' | 'Medium' | 'Large';
  price: number;
  totalPrice: number;
  image: string;
}

export interface IOrder extends Document {
  _id: string;
  orderId: string
  customerId: string;
  restaurantId: string;
  customerDetails: ICustomerDetails;
  cartItems: ICartItem[];
  orderTotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentType: string;
  orderStatus: string;
  driverDetails?: IDriverDetails;
  createdAt: Date;
  updatedAt: Date;
}

// This connects to the order-service MongoDB database
// We're using the same schema to ensure compatibility
const orderSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    customerId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    customerDetails: {
      name: { type: String, required: true },
      contact: { type: String, required: true },
      longitude: { type: Number, required: true },
      latitude: { type: Number, required: true },
      address: { type: String }
    },
    cartItems: [{
      itemId: { type: String, required: true },
      itemName: { type: String, required: true },
      quantity: { type: Number, required: true },
      potionSize: { type: String, enum: ['Small', 'Medium', 'Large'], required: true },
      price: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      image: { type: String }
    }],
    orderTotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentType: { type: String, required: true },
    orderStatus: { type: String, required: true },
    driverDetails: {
      driverId: { type: String },
      driverName: { type: String },
      vehicleNumber: { type: String },
      latitude: { type: Number },
      longitude: { type: Number }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    // This allows us to access fields that aren't in the schema
    strict: false
  }
);

// Connect to the order-service database instead
const connectionString = process.env.ORDER_SERVICE_DB_URI || 'mongodb://localhost:27017/order-service';

// Create a separate connection for the Order model
const orderDbConnection = mongoose.createConnection(connectionString);

const Order = orderDbConnection.model<IOrder>("Order", orderSchema);

export default Order;