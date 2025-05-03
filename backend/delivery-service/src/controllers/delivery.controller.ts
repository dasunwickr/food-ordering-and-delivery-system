// src/controllers/deliveryController.ts
import { Request, Response } from "express";
import Delivery from "../models/delivery.model";
import Order from "../models/order.model"; // Import Order model directly
import * as deliveryService from "../services/delivery.service";
import { broadcastNewOrder } from "../utils/socket.util"; // Import the broadcastNewOrder function
import axios from 'axios';

// Helper function to fetch restaurant details from user service
async function getRestaurantDetails(restaurantId: string) {
  try {
    if (!restaurantId) {
      console.log('No restaurant ID provided');
      return null;
    }
    
    console.log(`Fetching restaurant details for ID: ${restaurantId}`);
    const response = await axios.get(`http://localhost/api/user-service/users/${restaurantId}`, { // Fixed typo in URL
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (response.data) {
      return {
        name: response.data.restaurantName || `${response.data.firstName} ${response.data.lastName}'s Restaurant`,
        address: response.data.restaurantAddress || "Restaurant Address",
        phone: response.data.contactNumber || response.data.phone || "Restaurant Phone",
        location: response.data.location || { lat: 0, lng: 0 }
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching restaurant details for ID ${restaurantId}:`, error);
    return null;
  }
}

/**
 * Create a new delivery
 */
export const createDelivery = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({ error: 'orderId is required' });
      return;
    }

    // Verify the order exists in order-service DB first
    const order = await Order.findOne({ orderId });
    if (!order) {
      res.status(404).json({ error: 'Order not found in order-service database' });
      return;
    }

    // Check if the order already has a driver assigned
    if (order.driverDetails && order.driverDetails.driverId) {
      // If driver is already assigned, create the delivery with the assigned driver
      const delivery = await deliveryService.createDeliveryForNewOrder(orderId);
      res.status(201).json(delivery);
    } else {
      // Create a pending delivery entry
      const delivery = await deliveryService.createPendingDelivery(orderId);
      
      // Get necessary order details to broadcast to drivers
      const restaurantDetails = await getRestaurantDetails(order.restaurantId);
      const orderDetails = {
        orderId: order._id,
        restaurantId: order.restaurantId,
        restaurantDetails: restaurantDetails || {
          name: "Restaurant", 
          address: "Restaurant Address", 
          location: {
            lat: order.customerDetails?.latitude || 0, 
            lng: order.customerDetails?.longitude || 0
          }
        },
        customerDetails: {
          name: order.customerDetails?.name || "Customer",
          address: order.customerDetails?.address || "Customer Address",
          location: {
            lat: order.customerDetails?.latitude || 0,
            lng: order.customerDetails?.longitude || 0
          }
        },
        items: order.cartItems?.map(item => ({
          name: item.itemName,
          quantity: item.quantity
        })) || [],
        amount: order.totalAmount,
        createdAt: order.createdAt
      };
      
      // Broadcast the order to all available drivers
      broadcastNewOrder(orderId, orderDetails);
      
      res.status(201).json(delivery);
    }
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({ error: 'Failed to create delivery' });
  }
};

/**
 * Get all deliveries
 */
export const getAllDeliveries = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deliveries = await deliveryService.getAllDeliveries();
    res.status(200).json(deliveries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get deliveries by customer ID
 */
export const getDeliveriesByCustomerId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const customerId = req.params.customerId;
    const deliveries = await deliveryService.getDeliveriesByCustomerId(customerId);
    res.status(200).json(deliveries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get deliveries by driver ID
 */
export const getDeliveriesByDriverId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const driverId = req.params.driverId;
    const deliveries = await deliveryService.getDeliveriesByDriverId(driverId);
    res.status(200).json(deliveries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get deliveries by restaurant ID
 */
export const getDeliveriesByRestaurantId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const restaurantId = req.params.restaurantId;
    const deliveries = await deliveryService.getDeliveriesByRestaurantId(restaurantId);
    res.status(200).json(deliveries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a delivery by ID
 */
export const getDeliveryById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const delivery = await deliveryService.getDeliveryById(req.params.id);
    if (!delivery) {
      res.status(404).json({ error: "Delivery not found" });
      return;
    }
    res.status(200).json(delivery);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get delivery with order details
 */
export const getDeliveryWithOrderDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await deliveryService.getDeliveryWithOrderDetails(req.params.id);
    if (!result) {
      res.status(404).json({ error: "Delivery not found" });
      return;
    }

    // Check if restaurant location coordinates are missing but we have an address
    if (result.order && result.order.restaurantAddress && 
        (!result.order.restaurantLocation || 
         (result.order.restaurantLocation.lat === 0 && result.order.restaurantLocation.lng === 0))) {
      try {
        // Try to geocode the restaurant address
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: {
            q: result.order.restaurantAddress,
            format: 'json',
            limit: 1
          },
          headers: {
            'User-Agent': 'food-ordering-and-delivery-system'
          }
        });
        
        if (response.data && response.data.length > 0) {
          const location = {
            lat: parseFloat(response.data[0].lat),
            lng: parseFloat(response.data[0].lon)
          };
          
          // Set the calculated coordinates
          result.order.restaurantLocation = location;
          console.log(`Successfully geocoded restaurant address to coordinates: ${location.lat}, ${location.lng}`);
        }
      } catch (geocodeError) {
        console.error('Failed to geocode restaurant address:', geocodeError);
        // Continue with the response even if geocoding fails
      }
    }

    // Check if customer location coordinates are missing but we have an address
    if (result.order && result.order.customerDetails && 
        result.order.customerDetails.address && 
        (!result.order.customerDetails.latitude || !result.order.customerDetails.longitude)) {
      try {
        // Try to geocode the customer address
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: {
            q: result.order.customerDetails.address,
            format: 'json',
            limit: 1
          },
          headers: {
            'User-Agent': 'food-ordering-and-delivery-system'
          }
        });
        
        if (response.data && response.data.length > 0) {
          // Set the calculated coordinates
          result.order.customerDetails.latitude = parseFloat(response.data[0].lat);
          result.order.customerDetails.longitude = parseFloat(response.data[0].lon);
          console.log(`Successfully geocoded customer address to coordinates: ${result.order.customerDetails.latitude}, ${result.order.customerDetails.longitude}`);
        }
      } catch (geocodeError) {
        console.error('Failed to geocode customer address:', geocodeError);
        // Continue with the response even if geocoding fails
      }
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get delivery by order ID
 */
export const getDeliveryByOrderId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { orderId } = req.params;
    
    // First check our delivery collection
    const delivery = await Delivery.findOne({ orderId });
    
    if (delivery) {
      res.status(200).json(delivery);
      return;
    }
    
    // If not found in our collection, check the order service
    const order = await Order.findOne({ orderId });
    if (!order) {
      res.status(404).json({ error: 'Delivery not found' });
      return;
    }
    
    // Create a delivery object from the order data
    let status = "PENDING";
    switch (order.orderStatus.toLowerCase()) {
      case "out for delivery": status = "IN_PROGRESS"; break;
      case "delivered": status = "DELIVERED"; break;
      case "cancelled": status = "CANCELLED"; break;
      default: status = "PENDING";
    }
    
    const syntheticDelivery = {
      _id: `generated-${order._id}`,
      orderId: order._id,
      driverId: order.driverDetails?.driverId,
      status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
    
    res.status(200).json(syntheticDelivery);
  } catch (error: unknown) {
    console.error('Error fetching delivery:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Failed to fetch delivery: ${errorMessage}` });
  }
};

/**
 * Update a delivery
 */
export const updateDelivery = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updatedDelivery = await deliveryService.updateDelivery(
      req.params.id,
      req.body,
    );
    if (!updatedDelivery) {
      res.status(404).json({ error: "Delivery not found" });
      return;
    }
    res.status(200).json(updatedDelivery);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a delivery
 */
export const deleteDelivery = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deletedDelivery = await deliveryService.deleteDelivery(req.params.id);
    if (!deletedDelivery) {
      res.status(404).json({ error: "Delivery not found" });
      return;
    }
    res.status(200).json({ message: "Delivery deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Health Check Endpoint
 */
export const healthCheck = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Check connectivity to order service MongoDB
    const orderCount = await Order.countDocuments();
    res.status(200).json({ 
      status: "UP", 
      orderServiceConnection: "OK",
      orderCount 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      status: "ERROR",
      message: "Failed to connect to order service database",
      error: errorMessage
    });
  }
};

/**
 * Assign a driver to an order
 */
export const assignDriver = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { driverId, driverName, vehicleNumber } = req.body;

    console.log(orderId);
    
    
    if (!driverId || !orderId) {
      res.status(400).json({ error: 'driverId and orderId are required' });
      return;
    }
    
    // Update the delivery with the driver information
    const updatedDelivery = await deliveryService.assignDriverToDelivery(
      orderId,
      {
        driverId,
        driverName: driverName || "Driver",
        vehicleNumber: vehicleNumber || ""
      }
    );
    
    if (!updatedDelivery) {
      res.status(404).json({ error: "Delivery not found" });
      return;
    }
    
    res.status(200).json(updatedDelivery);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get pending orders that need drivers
 */
export const getPendingOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Find orders that are ready for delivery and don't have a driver assigned
    const pendingOrders = await Order.find({
      $and: [
        { 
          $or: [
            { orderStatus: "PAID" },
            { orderStatus: "Ready for Pickup" },
            { orderStatus: "Preparing" },
            { orderStatus: "Pending Delivery" } 
          ]
        },
        {
          $or: [
            { driverDetails: { $exists: false } },
            { "driverDetails.driverId": { $exists: false } },
            { "driverDetails.driverId": "" }
          ]
        }
      ]
    });
    
    console.log('Found pending orders:', pendingOrders.map(order => ({
      orderId: order._id,
      status: order.orderStatus
    })));
    
    const formattedOrders = await Promise.all(pendingOrders.map(async (order) => {
      // Ensure orderId is a string and not 0 or undefined
      const orderId = order._id && order._id !== '0' ? order._id : 
        (order._id ? order._id.toString() : `order-${Date.now()}-${Math.random().toString(36).substring(2,7)}`);
      
      // Fetch restaurant details from user-service
      const restaurantDetails = await getRestaurantDetails(order.restaurantId);
      
      return {
        orderId: orderId, // Use the validated orderId
        restaurantId: order.restaurantId,
        restaurantName: restaurantDetails?.name || "Restaurant", 
        restaurantAddress: restaurantDetails?.address || "Restaurant Address",  
        restaurantPhone: restaurantDetails?.phone || "Restaurant Phone", 
        restaurantLocation: restaurantDetails?.location || { 
          lat: 40.7128, 
          lng: -74.006
        },
        // Customer details from the order
        customerName: order.customerDetails?.name || "Customer",
        customerAddress: order.customerDetails?.address || "Customer Address",
        customerPhone: order.customerDetails?.contact || "Customer Phone",
        customerLocation: {
          lat: order.customerDetails?.latitude || 40.7303,
          lng: order.customerDetails?.longitude || -74.0054
        },
        // Order items
        items: order.cartItems?.map(item => ({
          itemName: item.itemName,
          quantity: item.quantity,
          price: item.price
        })) || [],
        // Order total
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt
      };
    }));
    
    console.log('Formatted orders to return:', formattedOrders.map(order => ({
      orderId: order.orderId,
      restaurantId: order.restaurantId
    })));
    
    res.status(200).json(formattedOrders);
  } catch (error: any) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ error: `Failed to fetch pending orders: ${error.message}` });
  }
};

/**
 * Accept a delivery by a driver
 */
export const acceptDelivery = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { deliveryId } = req.params;
    const { driverId, driverName, vehicleNumber } = req.body;
    
    if (!driverId || !deliveryId) {
      res.status(400).json({ error: 'driverId and deliveryId are required' });
      return;
    }

    // Update the delivery with the driver information and change status to ACCEPTED
    const updatedDelivery = await deliveryService.updateDelivery(
      deliveryId,
      {
        driverId,
        status: "ACCEPTED",
        acceptedAt: new Date()
      }
    );
    
    if (!updatedDelivery) {
      res.status(404).json({ error: "Delivery not found" });
      return;
    }
    
    // Also update driver details in the order
    try {
      // Get the order ID from the delivery
      const orderId = updatedDelivery.orderId;
      
      // Update the order with driver details
      await deliveryService.assignDriverToDelivery(
        orderId,
        {
          driverId,
          driverName: driverName || "Driver",
          vehicleNumber: vehicleNumber || ""
        }
      );
    } catch (orderUpdateError) {
      console.error("Error updating order with driver details:", orderUpdateError);
      // Continue despite error in updating order
    }
    
    res.status(200).json(updatedDelivery);
  } catch (error: any) {
    console.error('Error accepting delivery:', error);
    res.status(500).json({ error: error.message });
  }
};