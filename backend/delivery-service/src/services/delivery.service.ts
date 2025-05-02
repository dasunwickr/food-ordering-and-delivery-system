// src/services/deliveryService.ts

import Delivery, { IDelivery } from "../models/delivery.model";
import Order from "../models/order.model";
import { Server } from 'socket.io';

declare global {
  var io: Server | undefined;
}

/**
 * Create a new delivery
 */
export const createDelivery = async (
  deliveryData: Partial<IDelivery>,
): Promise<IDelivery> => {
  try {
    const newDelivery = new Delivery(deliveryData);
    return await newDelivery.save();
  } catch (error) {
    throw new Error(`Error creating delivery: ${error}`);
  }
};

/**
 * Create a delivery for a new order
 */
export const createDeliveryForNewOrder = async (
  orderId: string,
): Promise<IDelivery> => {
  try {
    // Check if a delivery already exists for this order
    const existingDelivery = await Delivery.findOne({ orderId });
    if (existingDelivery) {
      throw new Error('Delivery already exists for this order');
    }

    // Create new delivery with initial status
    const newDelivery = new Delivery({
      orderId,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedDelivery = await newDelivery.save();

    // Emit a socket event for real-time tracking
    global.io?.emit('delivery:created', {
      deliveryId: savedDelivery._id,
      orderId: savedDelivery.orderId,
      status: savedDelivery.status
    });

    return savedDelivery;
  } catch (error) {
    throw new Error(`Error creating delivery for order: ${error}`);
  }
};

/**
 * Get all deliveries
 */
export const getAllDeliveries = async (): Promise<IDelivery[]> => {
  try {
    return await Delivery.find();
  } catch (error) {
    throw new Error(`Error fetching deliveries: ${error}`);
  }
};

/**
 * Get deliveries by customer ID
 */
export const getDeliveriesByCustomerId = async (
  customerId: string
): Promise<IDelivery[]> => {
  try {
    // Find orders for this customer first
    const orders = await Order.find({ customerId });
    
    // Extract orderIds
    const orderIds = orders.map(order => order.orderId);
    
    // Find deliveries with these orderIds
    return await Delivery.find({ orderId: { $in: orderIds } });
  } catch (error) {
    throw new Error(`Error fetching customer deliveries: ${error}`);
  }
};

/**
 * Get deliveries by driver ID
 */
export const getDeliveriesByDriverId = async (
  driverId: string
): Promise<IDelivery[]> => {
  try {
    return await Delivery.find({ driverId });
  } catch (error) {
    throw new Error(`Error fetching driver deliveries: ${error}`);
  }
};

/**
 * Get deliveries by restaurant ID
 */
export const getDeliveriesByRestaurantId = async (
  restaurantId: string
): Promise<IDelivery[]> => {
  try {
    // Find orders for this restaurant first
    const orders = await Order.find({ restaurantId });
    
    // Extract orderIds
    const orderIds = orders.map(order => order.orderId);
    
    // Find deliveries with these orderIds
    return await Delivery.find({ orderId: { $in: orderIds } });
  } catch (error) {
    throw new Error(`Error fetching restaurant deliveries: ${error}`);
  }
};

/**
 * Get a delivery by ID
 */
export const getDeliveryById = async (
  deliveryId: string,
): Promise<IDelivery | null> => {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new Error("Delivery not found");
    }
    return delivery;
  } catch (error) {
    throw new Error(`Error fetching delivery: ${error}`);
  }
};

/**
 * Get delivery with order details
 */
export const getDeliveryWithOrderDetails = async (
  deliveryId: string
): Promise<{ delivery: IDelivery; order: any } | null> => {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new Error("Delivery not found");
    }
    
    // Find the corresponding order
    const order = await Order.findOne({ orderId: delivery.orderId });
    if (!order) {
      throw new Error("Associated order not found");
    }
    
    return { delivery, order };
  } catch (error) {
    throw new Error(`Error fetching delivery with order details: ${error}`);
  }
};

/**
 * Update a delivery
 */
export const updateDelivery = async (
  deliveryId: string,
  updateData: Partial<IDelivery>,
): Promise<IDelivery | null> => {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new Error("Delivery not found");
    }

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      updateData,
      { new: true },
    );
    return updatedDelivery;
  } catch (error) {
    throw new Error(`Error updating delivery: ${error}`);
  }
};

/**
 * Delete a delivery
 */
export const deleteDelivery = async (
  deliveryId: string,
): Promise<IDelivery | null> => {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new Error("Delivery not found");
    }

    return await Delivery.findByIdAndDelete(deliveryId);
  } catch (error) {
    throw new Error(`Error deleting delivery: ${error}`);
  }
};