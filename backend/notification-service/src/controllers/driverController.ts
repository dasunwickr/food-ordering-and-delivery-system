import { Request, Response } from 'express';
import { DriverModel } from '../models/driverModel';
import { sendSMS, sendEmail } from '../services/notificationService';

// Allocate a delivery to a driver
export const allocateDelivery = async (req: Request, res: Response): Promise<void> => {
  const { driverId, name, phoneNumber, email, orderId } = req.body;

  if (!driverId || !name || !phoneNumber || !email || !orderId) {
    res.status(400).json({ error: 'Missing required fields: driverId, name, phoneNumber, email, orderId' });
    return;
  }

  try {
    // Check if the driver already exists in the database
    let driver = await DriverModel.findOne({ driverId });

    if (driver) {
      // Update the driver's allocation details
      driver.orderId = orderId;
      driver.status = 'allocated';
      driver.updatedAt = new Date();
      await driver.save();
    } else {
      // Create a new driver record
      driver = new DriverModel({ driverId, name, phoneNumber, email, orderId, status: 'allocated' });
      await driver.save();
    }

    // Prepare the notification message
    const smsMessage = `📦 Delivery Allocated: You have been assigned order #${orderId}. Please proceed with the delivery.`;
    const emailSubject = `🚚 Delivery Allocated - Order #${orderId}`;
    const emailText = `You have been assigned order #${orderId}. Please proceed with the delivery.`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745; text-align: center;">🚚 Delivery Allocated</h1>
        <p style="font-size: 18px; text-align: center;">You have been assigned order #<strong>${orderId}</strong>.</p>
        <p style="font-size: 16px; text-align: center;">Please proceed with the delivery.</p>
        <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
          Thank you for your service! ❤️
        </p>
      </div>
    `;

    // Send SMS notification
    await sendSMS(phoneNumber, smsMessage);

    // Send email notification
    await sendEmail(email, emailSubject, emailText, emailHtml);

    res.status(200).json({ success: true, message: 'Delivery allocated successfully' });
  } catch (error) {
    console.error('Error allocating delivery:', error);
    res.status(500).json({ error: 'Failed to allocate delivery' });
  }
};