import { Request, Response } from 'express';
import { sendPaymentNotification,sendDriverPaymentDepositedNotification,sendRestaurantPaymentDepositedNotification } from '../services/notificationService';

// Process payment and send notification
export const processPayment = async (req: Request, res: Response): Promise<void> => {
  const { userId, orderId, phoneNumber, email, paymentStatus } = req.body;

  if (!userId || !orderId || !phoneNumber || !email || !paymentStatus) {
    res.status(400).json({ error: 'Missing required fields: userId, orderId, phoneNumber, email, paymentStatus' });
    return;
  }

  try {
    // Simulate payment processing logic here
    console.log(`Processing payment for order (#${orderId}) with status: ${paymentStatus}`);

    // Send payment notification
    await sendPaymentNotification(paymentStatus, phoneNumber, email, orderId);

    res.status(200).json({ success: true, message: 'Payment processed successfully' });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};


// Notify driver about payment deposit
export const notifyDriverAboutPaymentDeposit = async (req: Request, res: Response): Promise<void> => {
  const { driverName, phoneNumber, email, amount } = req.body;

  if (!driverName || !phoneNumber || !email || !amount) {
    res.status(400).json({ error: 'Missing required fields: driverName, phoneNumber, email, amount' });
    return;
  }

  try {
    // Send driver payment deposit notification
    await sendDriverPaymentDepositedNotification(phoneNumber, email, driverName, amount);

    res.status(200).json({ success: true, message: 'Driver payment deposited notification sent successfully' });
  } catch (error) {
    console.error('Error notifying driver about payment deposit:', error);
    res.status(500).json({ error: 'Failed to notify driver about payment deposit' });
  }
};



// Notify restaurant about payment deposit
export const notifyRestaurantAboutPaymentDeposit = async (req: Request, res: Response): Promise<void> => {
  const { restaurantName, phoneNumber, email, amount } = req.body;

  if (!restaurantName || !phoneNumber || !email || !amount) {
    res.status(400).json({ error: 'Missing required fields: restaurantName, phoneNumber, email, amount' });
    return;
  }

  try {
    // Send restaurant payment deposit notification
    await sendRestaurantPaymentDepositedNotification(phoneNumber, email, restaurantName, amount);

    res.status(200).json({ success: true, message: 'Restaurant payment deposited notification sent successfully' });
  } catch (error) {
    console.error('Error notifying restaurant about payment deposit:', error);
    res.status(500).json({ error: 'Failed to notify restaurant about payment deposit' });
  }
};