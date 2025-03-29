import { Request, Response } from 'express';
import { OrderModel } from '../models/orderModel';
import { websocketUtils } from '../utils/websocketUtils';
import { sendSMS, sendEmail } from '../services/notificationService';

// Place a new order
export const placeOrder = async (req: Request, res: Response): Promise<void> => {
  const { userId, orderId, phoneNumber, email } = req.body;

  if (!userId || !orderId || !phoneNumber || !email) {
    res.status(400).json({ error: 'Missing required fields: userId, orderId, phoneNumber, email' });
    return;
  }

  try {
    // Create a new order in the database
    const newOrder = new OrderModel({ orderId, userId, status: 'placed' });
    await newOrder.save();

    // Notify the user via WebSocket
    const userSocket = websocketUtils.clients.get(userId);
    if (userSocket) {
      userSocket.send(JSON.stringify({ type: 'orderPlaced', orderId }));
    }

    // Send SMS notification
    const smsMessage = `Your order (${orderId}) has been successfully placed.`;
    await sendSMS(phoneNumber, smsMessage);

    // Send email notification
    const emailSubject = 'Order Confirmation';
    const emailText = `Thank you for placing your order (${orderId}). We will update you on the status soon.`;
    await sendEmail(email, emailSubject, emailText);

    res.status(201).json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order'});
  }
};