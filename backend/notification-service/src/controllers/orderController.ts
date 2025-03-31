import { Request, Response } from 'express';
import { OrderModel } from '../models/orderModel';
import { websocketUtils } from '../utils/websocketUtils';
import { sendSMS, sendEmail, sendOrderStatusNotification } from '../services/notificationService';


// Place or update an order
export const placeOrder = async (req: Request, res: Response): Promise<void> => {
  const { userId, orderId, phoneNumber, email, status } = req.body;

  if (!userId || !orderId || !phoneNumber || !email || !status) {
    res.status(400).json({ error: 'Missing required fields: userId, orderId, phoneNumber, email, status' });
    return;
  }

  try {
    // Check if an order with the given orderId already exists
    const existingOrder = await OrderModel.findOne({ orderId });

    if (existingOrder) {
      // Update the status of the existing order
      existingOrder.status = status;
      existingOrder.updatedAt = new Date();
      await existingOrder.save();

      // Notify the user via WebSocket
      const userSocket = websocketUtils.clients.get(userId);
      if (userSocket) {
        userSocket.send(JSON.stringify({ type: 'orderUpdated', orderId, status }));
      }
      // Send order status notification (SMS and Email)
      await sendOrderStatusNotification(status, phoneNumber, email, orderId);

      res.status(200).json({ success: true, message: 'Order status updated successfully' });
    } else {
      // Create a new order in the database
      const newOrder = new OrderModel({ orderId, userId, status });
      await newOrder.save();

      // Notify the user via WebSocket
      const userSocket = websocketUtils.clients.get(userId);
      if (userSocket) {
        userSocket.send(JSON.stringify({ type: 'orderPlaced', orderId }));
      }
      
      // Send order status notification (SMS and Email)
      await sendOrderStatusNotification(status, phoneNumber, email, orderId);

      res.status(201).json({ success: true, message: 'Order placed successfully' });
    }
  } catch (error) {
    console.error('Error placing/updating order:', error);
    res.status(500).json({ error: 'Failed to place/update order' });
  }
};