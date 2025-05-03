// src/services/deliveryService.ts

import Delivery, { IDelivery, IDeliveryData } from "../models/delivery.model";
import Order from "../models/order.model";
import { Server } from 'socket.io';

declare global {
  var io: Server | undefined;
}

/**
 * Create a new delivery
 */
export const createDelivery = async (
  deliveryData: Partial<IDeliveryData>,
): Promise<IDeliveryData> => {
  try {
    const newDelivery = new Delivery(deliveryData);
    const savedDelivery = await newDelivery.save();
    return toDeliveryData(savedDelivery);
  } catch (error) {
    throw new Error(`Error creating delivery: ${error}`);
  }
};

/**
 * Create a delivery for a new order
 */
export const createDeliveryForNewOrder = async (
  orderId: string,
): Promise<IDeliveryData> => {
  try {
    // Check if a delivery already exists for this order
    const existingDelivery = await Delivery.findOne({ orderId });
    if (existingDelivery) {
      throw new Error('Delivery already exists for this order');
    }

    // Verify the order exists in order-service
    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new Error('Order not found in order-service');
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

    return toDeliveryData(savedDelivery);
  } catch (error) {
    throw new Error(`Error creating delivery for order: ${error}`);
  }
};

/**
 * Create a pending delivery (without a driver)
 */
export const createPendingDelivery = async (
  orderId: string,
): Promise<IDeliveryData> => {
  try {
    // Check if a delivery already exists for this order
    const existingDelivery = await Delivery.findOne({ orderId });
    if (existingDelivery) {
      throw new Error('Delivery already exists for this order');
    }

    // Verify the order exists in order-service
    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new Error('Order not found in order-service');
    }

    // Create new delivery with initial status and no driver
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

    return toDeliveryData(savedDelivery);
  } catch (error) {
    throw new Error(`Error creating pending delivery for order: ${error}`);
  }
};

/**
 * Driver details interface
 */
export interface IDriverDetails {
  driverId: string;
  driverName?: string;
  vehicleNumber?: string;
}

/**
 * Assign driver to a delivery
 */
export const assignDriverToDelivery = async (
  orderId: string,
  driverDetails: IDriverDetails
): Promise<IDeliveryData | null> => {
  try {
    console.log(`Assigning driver ${driverDetails.driverId} to order ${orderId}`);
    
    // First try to find the delivery by orderId
    const delivery = await Delivery.findOne({ orderId: orderId });
    
    if (delivery) {
      // Update the delivery with driver info
      delivery.driverId = driverDetails.driverId;
      delivery.status = "ACCEPTED"; // Change status from PENDING to ACCEPTED
      delivery.acceptedAt = new Date();
      delivery.updatedAt = new Date();
      
      const updatedDelivery = await delivery.save();
      
      // Update the order status in the order-service db
      const order = await Order.findOne({ _id: orderId });
      if (order) {
        // Update order with driver details
        if (!order.driverDetails) {
          order.driverDetails = {
            driverId: driverDetails.driverId,
            driverName: driverDetails.driverName || "Driver",
            vehicleNumber: driverDetails.vehicleNumber || ""
          };
        } else {
          order.driverDetails.driverId = driverDetails.driverId;
          if (driverDetails.driverName) order.driverDetails.driverName = driverDetails.driverName;
          if (driverDetails.vehicleNumber) order.driverDetails.vehicleNumber = driverDetails.vehicleNumber;
        }
        
        // Update order status to "Out for Delivery"
        order.orderStatus = "Out for Delivery";
        order.updatedAt = new Date();
        await order.save();
      }
      
      // Emit socket event for real-time tracking
      global.io?.emit('delivery:assigned', {
        deliveryId: updatedDelivery._id,
        orderId: updatedDelivery.orderId,
        driverId: driverDetails.driverId,
        status: updatedDelivery.status
      });
      
      return toDeliveryData(updatedDelivery);
    }
    
    // If delivery not found, check if we have a synthetic delivery from order
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      throw new Error("Order not found");
    }
    
    // Create a new delivery record with the driver info
    const newDelivery = new Delivery({
      orderId,
      driverId: driverDetails.driverId,
      status: "ACCEPTED",
      acceptedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedDelivery = await newDelivery.save();
    
    // Update order with driver details
    if (!order.driverDetails) {
      order.driverDetails = {
        driverId: driverDetails.driverId,
        driverName: driverDetails.driverName || "Driver",
        vehicleNumber: driverDetails.vehicleNumber || ""
      };
    } else {
      order.driverDetails.driverId = driverDetails.driverId;
      if (driverDetails.driverName) order.driverDetails.driverName = driverDetails.driverName;
      if (driverDetails.vehicleNumber) order.driverDetails.vehicleNumber = driverDetails.vehicleNumber;
    }
    
    // Update order status to "Out for Delivery"
    order.orderStatus = "Out for Delivery";
    order.updatedAt = new Date();
    await order.save();
    
    // Emit socket event for real-time tracking
    global.io?.emit('delivery:assigned', {
      deliveryId: savedDelivery._id,
      orderId: savedDelivery.orderId,
      driverId: driverDetails.driverId,
      status: savedDelivery.status
    });
    
    return toDeliveryData(savedDelivery);
  } catch (error) {
    throw new Error(`Error assigning driver to delivery: ${error}`);
  }
};

/**
 * Convert mongoose document to plain object
 */
function toDeliveryData(doc: IDelivery | any): IDeliveryData {
  if (!doc) {
    console.warn('Attempted to convert null/undefined to delivery data');
    return null as unknown as IDeliveryData;
  }
  
  // If it's already a plain object with _id
  if (!doc.toObject && doc._id) {
    return doc as IDeliveryData;
  }
  
  // If it's a mongoose document, convert to plain object
  const data = doc.toObject ? doc.toObject() : doc;
  
  // Ensure _id is always present and converted to string if it's an ObjectId
  if (!data._id && doc._id) {
    data._id = doc._id.toString();
  } else if (data._id && typeof data._id !== 'string') {
    // Convert ObjectId to string if needed
    data._id = data._id.toString();
  } else if (!data._id) {
    // Generate a placeholder ID if none exists
    // data._id = `generated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    console.trace('Warning: Delivery data has no _id field', data);
  }
  
  return data;
}

/**
 * Get all deliveries
 */
export const getAllDeliveries = async (): Promise<IDeliveryData[]> => {
  try {
    console.log('Fetching all deliveries');
    
    // Get all delivery records
    const deliveries = await Delivery.find();
    console.log(`Found ${deliveries.length} deliveries in the delivery-service DB`);
    
    // Also get all orders with delivery status
    const orders = await Order.find({});
    console.log(`Found ${orders.length} total orders in the order-service DB`);
    
    // Map order data to delivery format for any missing deliveries
    const deliveryOrderIds = deliveries.map(d => d.orderId);
    const missingDeliveries: IDeliveryData[] = orders
      .filter(order => order._id && !deliveryOrderIds.includes(order._id))
      .map(order => {
        // Map the order status to delivery status
        let status = "PENDING";
        const orderStatus = order.orderStatus?.toLowerCase() || "";
        switch (orderStatus) {
          case "out for delivery": status = "IN_PROGRESS"; break;
          case "delivered": status = "DELIVERED"; break;
          case "cancelled": status = "CANCELLED"; break;
          default: status = "PENDING";
        }
        
        return {
          _id : order._id ,
          orderId: order._id,
          driverId: order.driverDetails?.driverId,
          status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        };
      });
    
    console.log(`Created ${missingDeliveries.length} synthetic deliveries from orders`);
    
    // Convert mongoose documents to plain objects
    const deliveryDataArray = deliveries.map(toDeliveryData);
    
    const result = [...deliveryDataArray, ...missingDeliveries];
    console.log(`Returning ${result.length} total deliveries`);
    
    return result;
  } catch (error) {
    console.error(`Error fetching all deliveries:`, error);
    throw new Error(`Error fetching all deliveries: ${error}`);
  }
};

/**
 * Get deliveries by customer ID
 */
export const getDeliveriesByCustomerId = async (
  customerId: string
): Promise<IDeliveryData[]> => {
  try {
    // Find orders for this customer directly from the order service DB
    const orders = await Order.find({ customerId });
    
    if (!orders || orders.length === 0) {
      return [];
    }
    
    // Extract orderIds
    const orderIds = orders.map(order => order._id);
    
    // Find existing deliveries with these orderIds
    const existingDeliveries = await Delivery.find({ orderId: { $in: orderIds } });
    
    // For any orders without deliveries, create delivery-like objects
    const existingDeliveryOrderIds = existingDeliveries.map(d => d.orderId);
    const missingDeliveries: IDeliveryData[] = orders
      .filter(order => !existingDeliveryOrderIds.includes(order._id))
      .map(order => {
        // Map the order status to delivery status
        let status = "PENDING";
        switch (order.orderStatus.toLowerCase()) {
          case "out for delivery": status = "IN_PROGRESS"; break;
          case "delivered": status = "DELIVERED"; break;
          case "cancelled": status = "CANCELLED"; break;
          default: status = "PENDING";
        }
        
        return {
          _id: `generated-${order._id}`,
          orderId: order._id,
          driverId: order.driverDetails?.driverId,
          status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        };
      });
    
    // Convert mongoose documents to plain objects
    const deliveryDataArray = existingDeliveries.map(toDeliveryData);
    
    return [...deliveryDataArray, ...missingDeliveries];
  } catch (error) {
    throw new Error(`Error fetching customer deliveries: ${error}`);
  }
};

/**
 * Get deliveries by driver ID
 */
export const getDeliveriesByDriverId = async (
  driverId: string
): Promise<IDeliveryData[]> => {
  try {
    console.log(`Fetching deliveries for driver ID: ${driverId}`);
    
    // Find all orders assigned to this driver from the order service DB
    // Use a more flexible query to handle potential ID format differences
    const orders = await Order.find({ 
      $or: [
        { "driverDetails.driverId": driverId },
        { "driverDetails.driverId": driverId.toString() },
        { "driver.id": driverId },
        { "driver._id": driverId }
      ]
    });
    
    console.log(`Found ${orders.length} orders assigned to driver ID: ${driverId}`);
    
    let existingDeliveries: IDelivery[] = [];
    
    // Fallback to deliveries collection if no orders found
    if (!orders || orders.length === 0) {
      console.log(`No orders found in order-service DB, checking delivery-service DB`);
      existingDeliveries = await Delivery.find({ 
        $or: [
          { driverId: driverId },
          { "driver.id": driverId },
          { "driver._id": driverId }
        ]
      });
      
      console.log(`Found ${existingDeliveries.length} deliveries in delivery-service DB`);
      
      if (existingDeliveries.length === 0) {
        console.log('No deliveries found for this driver. Checking for any orders with driver details...');
        const ordersWithDrivers = await Order.find({ "driverDetails.driverId": { $exists: true } }).limit(5);
        console.log(`Sample of ${ordersWithDrivers.length} orders with driver details in the system:`, 
          ordersWithDrivers.map(o => ({
            orderId: o.orderId,
            driverId: o.driverDetails?.driverId,
            status: o.orderStatus
          }))
        );
      }
      
      return existingDeliveries.map(toDeliveryData);
    }
    
    // Log the order IDs found for this driver
    console.log('Order IDs assigned to this driver:', orders.map(o => o.orderId));
    
    // Extract orderIds
    const orderIds = orders.map(order => order._id);
    
    // Find existing deliveries with these orderIds
    existingDeliveries = await Delivery.find({ orderId: { $in: orderIds } });
    
    // For any orders without deliveries, create delivery-like objects
    const existingDeliveryOrderIds = existingDeliveries.map(d => d.orderId);
    const missingDeliveries: IDeliveryData[] = orders
      .filter(order => !existingDeliveryOrderIds.includes(order._id))
      .map(order => {
        // Map the order status to delivery status
        let status = "PENDING";
        switch (order.orderStatus?.toLowerCase() || "pending") {
          case "out for delivery": status = "IN_PROGRESS"; break;
          case "delivered": status = "DELIVERED"; break;
          case "cancelled": status = "CANCELLED"; break;
          default: status = "PENDING";
        }
        
        return {
          _id: `generated-${order._id}`,
          orderId: order._id,
          driverId: order.driverDetails?.driverId,
          status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        };
      });
    
    console.log(`Created ${missingDeliveries.length} synthetic deliveries from orders`);
    
    // Convert mongoose documents to plain objects
    const deliveryDataArray = existingDeliveries.map(toDeliveryData);
    
    const result = [...deliveryDataArray, ...missingDeliveries];
    console.log(`Returning ${result.length} total deliveries for driver`);
    
    return result;
  } catch (error) {
    console.error(`Error fetching driver deliveries:`, error);
    throw new Error(`Error fetching driver deliveries: ${error}`);
  }
};

/**
 * Get deliveries by restaurant ID
 */
export const getDeliveriesByRestaurantId = async (
  restaurantId: string
): Promise<IDeliveryData[]> => {
  try {
    console.log(`Fetching deliveries for restaurant ID: ${restaurantId}`);
    
    // Find orders for this restaurant directly from the order service DB
    // Use a more flexible query to handle potential ID format differences
    const orders = await Order.find({ 
      $or: [
        { restaurantId: restaurantId },
        { restaurantId: restaurantId.toString() },
        // If IDs might be stored as ObjectIDs in some places
        // and strings in others, this helps match both
        { "restaurant.id": restaurantId },
        { "restaurant._id": restaurantId }
      ] 
    });
    
    console.log(`Found ${orders.length} orders for restaurant ID: ${restaurantId}`);
    
    if (!orders || orders.length === 0) {
      // For debugging, let's see ALL orders in the system to identify potential issues
      console.log('No orders found for this restaurant. Checking all orders in the system...');
      const allOrders = await Order.find({}).limit(5);
      console.log(`Sample of 5 orders in the system:`, 
        allOrders.map(o => ({
          orderId: o.orderId,
          restaurantId: o.restaurantId,
          status: o.orderStatus
        }))
      );
      return [];
    }
    
    // Log the order IDs found for this restaurant
    console.log('Order IDs found:', orders.map(o => o.orderId));
    
    // Extract orderIds - ensure they are valid
    const orderIds = orders
      .filter(order => order._id && order._id !== 'undefined')
      .map(order => order._id);
    
    console.log(`Found ${orderIds.length} valid order IDs`);
    
    // Find existing deliveries with these orderIds
    const existingDeliveries = await Delivery.find({ orderId: { $in: orderIds } });
    
    // For any orders without deliveries, create delivery-like objects
    const existingDeliveryOrderIds = existingDeliveries.map(d => d.orderId);
    const missingDeliveries: IDeliveryData[] = orders
      .filter(order => order._id && order._id !== 'undefined' && !existingDeliveryOrderIds.includes(order._id))
      .map(order => {
        // Map the order status to delivery status
        let status = "PENDING";
        switch (order.orderStatus?.toLowerCase() || "pending") {
          case "out for delivery": status = "IN_PROGRESS"; break;
          case "delivered": status = "DELIVERED"; break;
          case "cancelled": status = "CANCELLED"; break;
          default: status = "PENDING";
        }
        
        return {
          _id: `generated-${order._id}`,
          orderId: order._id,
          driverId: order.driverDetails?.driverId,
          status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        };
      });
    
    console.log(`Created ${missingDeliveries.length} synthetic deliveries from orders`);
    
    // Convert mongoose documents to plain objects
    const deliveryDataArray = existingDeliveries.map(toDeliveryData);
    
    const result = [...deliveryDataArray, ...missingDeliveries];
    console.log(`Returning ${result.length} total deliveries for restaurant`);
    
    return result;
  } catch (error) {
    console.error(`Error fetching restaurant deliveries:`, error);
    throw new Error(`Error fetching restaurant deliveries: ${error}`);
  }
};

/**
 * Get a delivery by ID
 */
export const getDeliveryById = async (
  deliveryId: string,
): Promise<IDeliveryData | null> => {
  try {
    // First try to find the delivery in the delivery collection
    const delivery = await Delivery.findById(deliveryId);
    if (delivery) {
      return toDeliveryData(delivery);
    }
    
    // If deliveryId is in the format "generated-{orderId}", get the original order
    if (deliveryId.startsWith('generated-')) {
      const orderId = deliveryId.replace('generated-', '');
      
      // Check if orderId is valid (not undefined or empty)
      if (!orderId || orderId === 'undefined') {
        throw new Error("Invalid order ID in the generated delivery ID");
      }
      
      const order = await Order.findOne({ orderId });
      
      if (!order) {
        throw new Error("Delivery not found");
      }
      
      // Convert order data to delivery format
      let status = "PENDING";
      switch (order.orderStatus.toLowerCase()) {
        case "out for delivery": status = "IN_PROGRESS"; break;
        case "delivered": status = "DELIVERED"; break;
        case "cancelled": status = "CANCELLED"; break;
        default: status = "PENDING";
      }
      
      // Return a delivery-like object
      return {
        _id: `generated-${order._id}`,
        orderId: order._id,
        driverId: order.driverDetails?.driverId,
        status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    }
    
    throw new Error("Delivery not found");
  } catch (error) {
    throw new Error(`Error fetching delivery: ${error}`);
  }
};

/**
 * Get delivery with order details
 */
export const getDeliveryWithOrderDetails = async (
  deliveryId: string
): Promise<{ delivery: IDeliveryData; order: any } | null> => {
  try {
    // First try to find the delivery in the delivery collection
    let delivery: IDeliveryData | null = null;
    let orderId: string;
    
    if (deliveryId.startsWith('generated-')) {
      // If it's a generated ID, extract the orderId
      orderId = deliveryId.replace('generated-', '');
      
      // Check if orderId is valid (not undefined or empty)
      if (!orderId || orderId === 'undefined') {
        throw new Error("Invalid order ID in the generated delivery ID");
      }
      
      // Get the order first
      const order = await Order.findOne({ _id:orderId });
      if (!order) {
        throw new Error("Associated order not found");
      }
      
      // Create a delivery object from order data
      let status = "PENDING";
      switch (order.orderStatus.toLowerCase()) {
        case "out for delivery": status = "IN_PROGRESS"; break;
        case "delivered": status = "DELIVERED"; break;
        case "cancelled": status = "CANCELLED"; break;
        default: status = "PENDING";
      }
      
      delivery = {
        _id: `generated-${order._id}`,
        orderId: order._id,
        driverId: order.driverDetails?.driverId,
        status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
      
      // Return both
      return { delivery, order: order.toObject() };
    } else {
      // Regular delivery ID
      const deliveryDoc = await Delivery.findById(deliveryId);
      
      if (!deliveryDoc) {
        throw new Error("Delivery not found");
      }
      
      delivery = toDeliveryData(deliveryDoc);
      orderId = delivery.orderId;
    }
    
    // Find the corresponding order from order service DB
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      throw new Error("Associated order not found");
    }
    
    return { delivery, order: order.toObject() };
  } catch (error) {
    throw new Error(`Error fetching delivery with order details: ${error}`);
  }
};

/**
 * Update a delivery
 */
export const updateDelivery = async (
  deliveryId: string,
  updateData: Partial<IDeliveryData>,
): Promise<IDeliveryData | null> => {
  try {
    // Check if this is a generated delivery ID
    if (deliveryId.startsWith('generated-')) {
      const orderId = deliveryId.replace('generated-', '');
      
      // Find the order in the order-service db
      const order = await Order.findOne({ orderId });
      if (!order) {
        throw new Error("Order not found");
      }
      
      // Create a new delivery record for this order
      const deliveryRecord = new Delivery({
        orderId: order._id,
        driverId: order.driverDetails?.driverId || updateData.driverId,
        status: updateData.status || "PENDING",
        acceptedAt: updateData.acceptedAt,
        deliveredAt: updateData.deliveredAt
      });
      
      // Save the new record
      const savedDelivery = await deliveryRecord.save();
      
      // Also update the order status in the order-service db
      let orderStatus = "Pending";
      switch (savedDelivery.status.toLowerCase()) {
        case "in_progress": 
          orderStatus = "Out for Delivery"; 
          break;
        case "delivered": 
          orderStatus = "Delivered"; 
          break;
        case "cancelled": 
          orderStatus = "Cancelled"; 
          break;
        default: 
          orderStatus = "Pending Delivery";
      }
      
      // Update the order
      order.orderStatus = orderStatus;
      await order.save();
      
      // Emit socket events for real-time tracking
      global.io?.emit('delivery:updated', {
        deliveryId: savedDelivery._id,
        orderId: savedDelivery.orderId,
        status: savedDelivery.status
      });
      
      return toDeliveryData(savedDelivery);
    }
    
    // Regular delivery ID - update in our collection
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new Error("Delivery not found");
    }

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      updateData,
      { new: true },
    );
    
    if (updatedDelivery) {
      // Also update the order status in the order-service db
      const order = await Order.findOne({ orderId: updatedDelivery.orderId });
      if (order) {
        let orderStatus = "Pending";
        switch (updatedDelivery.status.toLowerCase()) {
          case "in_progress": 
            orderStatus = "Out for Delivery"; 
            break;
          case "delivered": 
            orderStatus = "Delivered"; 
            break;
          case "cancelled": 
            orderStatus = "Cancelled"; 
            break;
          default: 
            orderStatus = "Pending Delivery";
        }
        
        // Update the order
        order.orderStatus = orderStatus;
        await order.save();
      }
      
      // Emit socket events for real-time tracking
      global.io?.emit('delivery:updated', {
        deliveryId: updatedDelivery._id,
        orderId: updatedDelivery.orderId,
        status: updatedDelivery.status
      });
    }
    
    return updatedDelivery ? toDeliveryData(updatedDelivery) : null;
  } catch (error) {
    throw new Error(`Error updating delivery: ${error}`);
  }
};

/**
 * Delete a delivery
 */
export const deleteDelivery = async (
  deliveryId: string,
): Promise<IDeliveryData | null> => {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new Error("Delivery not found");
    }

    const deletedDelivery = await Delivery.findByIdAndDelete(deliveryId);
    return deletedDelivery ? toDeliveryData(deletedDelivery) : null;
  } catch (error) {
    throw new Error(`Error deleting delivery: ${error}`);
  }
};