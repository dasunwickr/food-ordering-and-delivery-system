import { Request, Response } from 'express';
import { OrderModel } from '../models/orderModel';
import { websocketUtils } from '../utils/websocketUtils';
import { sendSMS, sendEmail, sendOrderStatusNotification } from '../services/notificationService';

// Add a new order
export const addOrder = async (req: Request, res: Response): Promise<void> => {
  const { userId, orderId, phoneNumber, restuarantMail, email } = req.body;

  if (!userId || !orderId || !phoneNumber || !email) {
    res.status(400).json({ error: 'Missing required fields: userId, orderId, phoneNumber, email' });
    return;
  }

  try {
    // Check if an order with the given orderId already exists
    const existingOrder = await OrderModel.findOne({ orderId });

    if (existingOrder) {
      res.status(400).json({ error: 'An order with this orderId already exists' });
      return;
    }

    // Create a new order in the database with default status "confirmed"
    const newOrder = new OrderModel({
      orderId,
      userId,
      phoneNumber, // Include phoneNumber here
      email,
      restuarantMail: restuarantMail || null, // Optional field
      status: 'confirmed',
    });
    await newOrder.save();

    // Notify the user via WebSocket
    const userSocket = websocketUtils.clients.get(userId);
    if (userSocket) {
      userSocket.send(JSON.stringify({ type: 'orderPlaced', orderId }));
    }

    // Send order confirmation notification (SMS and Email) to the user
    // await sendOrderStatusNotification('confirmed', phoneNumber, email, orderId);

    // Send email notification to the restaurant if restuarantMail is provided
    if (restuarantMail) {
      const restaurantEmailSubject = `New Order Received (#${orderId})`;
      const restaurantEmailText = `
        A new order has been placed:
        Order ID: ${orderId}
        User ID: ${userId}
        Status: confirmed
      `;
      const restaurantEmailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #28a745; text-align: center;">📝 New Order Received</h1>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Status:</strong> confirmed</p>
          <p><strong>Customer Phone Number:</strong> ${phoneNumber}</p>
          <p><strong>Customer Email:</strong> ${email}</p>
          <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
            Please prepare the order and update the status accordingly. ❤️
          </p>
        </div>
      `;

      await sendEmail(restuarantMail, restaurantEmailSubject, restaurantEmailText, restaurantEmailHtml);
    }

    res.status(201).json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).json({ error: 'Failed to add order' });
  }
};

// Update the status of an existing order
// Update the status of an existing order
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params; // Extract orderId from URL parameters
  const { status } = req.body;

  if (!orderId || !status) {
    res.status(400).json({ error: 'Missing required fields: orderId, status' });
    return;
  }

  try {
    // Find the order by orderId
    const order = await OrderModel.findOne({ orderId });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Validate the status transition
    const validStatuses = ['confirmed', 'preperation completed', 'out-for-delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    // Update the status of the existing order
    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    

    // Notify the user via WebSocket
    const userSocket = websocketUtils.clients.get(order.userId);
    if (userSocket) {
      userSocket.send(JSON.stringify({ type: 'orderUpdated', orderId, status }));
    }

    // Notify the restaurant if the status is "delivered" or "cancelled"
    if (['delivered', 'cancelled'].includes(status)) {
      if (order.restuarantMail) {
        console.log(`Notifying restaurant at email: ${order.restuarantMail}`);
        await notifyRestaurant(order, status, order.restuarantMail);
      } else {
        console.warn('Restaurant email is missing. Skipping email notification.');
      }
    }

    res.status(200).json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Notify the restaurant when the order status is "delivered" or "cancelled"
const notifyRestaurant = async (
  order: any,
  status: string,
  restuarantMail: string
): Promise<void> => {
  // Validate the status before proceeding
  if (!['delivered', 'cancelled'].includes(status)) {
    console.warn(`Invalid status (${status}) for notifying the restaurant. Skipping notification.`);
    return;
  }

  // Define SMS and email content based on the status
  const smsMessage =
    status === 'delivered'
      ? `🎉 Order #${order.orderId} has been delivered successfully.`
      : `❌ Order #${order.orderId} has been cancelled.`;

  const emailSubject =
    status === 'delivered'
      ? `🎉 Order #${order.orderId} Delivered`
      : `❌ Order #${order.orderId} Cancelled`;

  const emailText =
    status === 'delivered'
      ? `Order #${order.orderId} has been delivered successfully. Thank you!`
      : `Order #${order.orderId} has been cancelled. We apologize for any inconvenience.`;

  const emailHtml =
    status === 'delivered'
      ? `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #28a745; text-align: center;">🎉 Order Delivered</h1>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Status:</strong> Delivered</p>
          <p>Thank you for your service! ❤️</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc3545; text-align: center;">❌ Order Cancelled</h1>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Status:</strong> Cancelled</p>
          <p>We apologize for any inconvenience caused. ❤️</p>
        </div>
      `;

  try {
    // Send SMS notification to the restaurant (if enabled)
    // Uncomment the following line if SMS notifications are required
    // await sendSMS(order.phoneNumber, smsMessage);

    // Log the email details for debugging
    // console.log('Attempting to send email to restaurant:', {
    //   to: restuarantMail,
    //   subject: emailSubject,
    //   text: emailText,
    //   html: emailHtml,
    // });

    // Send email notification to the restaurant
    const emailResponse = await sendEmail(restuarantMail, emailSubject, emailText, emailHtml);
    // console.log('Email sent successfully:', emailResponse);

    // Log a success message
    // console.log(`Notification sent to restaurant (${restuarantMail}) for order #${order.orderId}: ${status}`);
  } catch (error) {
    // Log any errors during the notification process
    console.error(`Failed to notify restaurant (${restuarantMail}) for order #${order.orderId}:`, error);
  }
};