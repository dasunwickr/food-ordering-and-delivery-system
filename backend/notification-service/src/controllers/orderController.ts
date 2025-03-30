import { Request, Response } from 'express';
import { OrderModel } from '../models/orderModel';
import { websocketUtils } from '../utils/websocketUtils';
import { sendSMS, sendEmail } from '../services/notificationService';

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

      // Styled SMS notification for status update
      const smsMessage = `📦 Your Order (#${orderId}) status has been updated to: ${status}.`;
      await sendSMS(phoneNumber, smsMessage);

      // Styled email notification for status update
      const emailSubject = `🚚 Order Status Update - Your Order (#${orderId}) is ${status}`;
      const emailText = `Your order (#${orderId}) status has been updated to: ${status}.`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #28a745; text-align: center;">🚚 Order Status Update</h1>
          <p style="font-size: 18px; text-align: center;">Your order (#<strong>${orderId}</strong>) status has been updated to:</p>
          <p style="font-size: 24px; font-weight: bold; text-align: center; color: #007bff;">${status}</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p style="font-size: 16px;">We will keep you updated on the progress of your order. If you have any questions, feel free to contact us.</p>
          </div>
          <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
            Thank you for choosing us! ❤️
          </p>
        </div>
      `;

      await sendEmail(email, emailSubject, emailText, emailHtml);

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

      // Styled SMS notification for new order
      const smsMessage = `📦 Your Order (#${orderId}) has been successfully placed! 🎉\n\nWe'll update you on the status soon.`;
      await sendSMS(phoneNumber, smsMessage);

      // Styled email notification for new order
      const emailSubject = '🎉 Order Confirmation - Thank You for Your Purchase!';
      const emailText = `Thank you for placing your order (#${orderId}). We will update you on the status soon.`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #28a745; text-align: center;">🎉 Thank You for Your Order! 🎉</h1>
          <p style="font-size: 18px; text-align: center;">Your order (#<strong>${orderId}</strong>) has been successfully placed.</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p style="font-size: 16px;">We are processing your order and will update you on the status soon. If you have any questions, feel free to contact us.</p>
            <p style="font-size: 16px; font-weight: bold; text-align: center;">Order ID: ${orderId}</p>
          </div>
          <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
            Thank you for choosing us! ❤️
          </p>
        </div>
      `;

      await sendEmail(email, emailSubject, emailText, emailHtml);

      res.status(201).json({ success: true, message: 'Order placed successfully' });
    }
  } catch (error) {
    console.error('Error placing/updating order:', error);
    res.status(500).json({ error: 'Failed to place/update order' });
  }
};