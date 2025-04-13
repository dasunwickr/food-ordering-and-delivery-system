import { Request, Response } from 'express';
import { DriverApplicationModel } from '../models/diverStatusModel';
import { sendSMS, sendEmail } from '../services/notificationService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Apply to become a delivery driver
export const applyToBecomeDriver = async (req: Request, res: Response): Promise<void> => {
  const { userId, name, phoneNumber, email } = req.body;

  if (!userId || !name || !phoneNumber || !email) {
    res.status(400).json({ error: 'Missing required fields: userId, name, phoneNumber, email' });
    return;
  }

  try {
    // Check if the user has already applied
    const existingApplication = await DriverApplicationModel.findOne({ userId });

    if (existingApplication) {
      res.status(400).json({ error: 'You have already applied to become a delivery driver' });
      return;
    }

    // Create a new application
    const newApplication = new DriverApplicationModel({ userId, name, phoneNumber, email, status: 'pending' });
    await newApplication.save();

    // Notify the admin via email
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('Admin email is not configured in the .env file.');
    } else {
      const adminEmailSubject = `New Delivery Driver Application Submitted`;
      const adminEmailText = `
        A new application has been submitted by ${name} (${email}).
        User ID: ${userId}
        Phone Number: ${phoneNumber}
      `;
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #28a745; text-align: center;">📝 New Delivery Driver Application</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Phone Number:</strong> ${phoneNumber}</p>
          <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
            Please review the application and take appropriate action. ❤️
          </p>
        </div>
      `;

      await sendEmail(adminEmail, adminEmailSubject, adminEmailText, adminEmailHtml);
    }

    res.status(201).json({ success: true, message: 'Your application has been submitted successfully' });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// Update application status (Admin action)
export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params; // Extract userId from URL parameters
    const { status } = req.body;  // Extract status from the request body
  
    if (!userId) {
      res.status(400).json({ error: 'Missing required field: userId' });
      return;
    }
  
    if (!status || !['approved', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected"' });
      return;
    }
  
    try {
      // Find the application by userId
      const application = await DriverApplicationModel.findOne({ userId });
  
      if (!application) {
        res.status(404).json({ error: 'Application not found' });
        return;
      }
  
      // Update the application status
      application.status = status;
      application.updatedAt = new Date();
      await application.save();
  
      // Notify the applicant via SMS and email
      const smsMessage =
        status === 'approved'
          ? `🎉 Congratulations! Your application to become a delivery driver has been approved.`
          : `❌ Unfortunately, your application to become a delivery driver has been rejected.`;
  
      const emailSubject =
        status === 'approved'
          ? '🎉 Your Application Has Been Approved!'
          : '❌ Your Application Has Been Rejected';
  
      const emailText =
        status === 'approved'
          ? `Congratulations! Your application to become a delivery driver has been approved. Please proceed with the next steps.`
          : `Unfortunately, your application to become a delivery driver has been rejected. Thank you for your interest.`;
  
      const emailHtml =
        status === 'approved'
          ? `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #28a745; text-align: center;">🎉 Congratulations!</h1>
              <p style="font-size: 18px; text-align: center;">Your application to become a delivery driver has been approved.</p>
              <p style="font-size: 16px; text-align: center;">Please proceed with the next steps.</p>
              <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
                Thank you for your interest! ❤️
              </p>
            </div>
          `
          : `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #dc3545; text-align: center;">❌ Application Rejected</h1>
              <p style="font-size: 18px; text-align: center;">Unfortunately, your application to become a delivery driver has been rejected.</p>
              <p style="font-size: 16px; text-align: center;">Thank you for your interest.</p>
              <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
                We appreciate your time and effort. ❤️
              </p>
            </div>
          `;
  
      // Send SMS notification
      await sendSMS(application.phoneNumber, smsMessage);
  
      // Send email notification
      await sendEmail(application.email, emailSubject, emailText, emailHtml);
  
      res.status(200).json({ success: true, message: `Application status updated to ${status}` });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({ error: 'Failed to update application status' });
    }
  };