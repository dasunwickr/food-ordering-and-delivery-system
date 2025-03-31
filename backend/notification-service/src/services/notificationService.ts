import twilio from 'twilio';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Twilio client setup
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Nodemailer transporter setup
const emailTransporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email service provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send SMS notification
export const sendSMS = async (phoneNumber: string, message: string): Promise<void> => {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`SMS sent to ${phoneNumber}: ${message}`);
  } catch (error) {
    console.error(`Failed to send SMS to ${phoneNumber}:`, error);
    throw error;
  }
};

// Send email notification to a single recipient
export const sendEmail = async (
  email: string,
  subject: string,
  text: string,
  html?: string // Optional HTML content
): Promise<void> => {
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text, // Plain text fallback
      html, // Optional HTML content
    });
    console.log(`Email sent to ${email}: ${subject}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
    throw error;
  }
};

// Broadcast email to multiple recipients
export const broadcastEmails = async (
  filePath: string,
  subject: string,
  text: string,
  html?: string // Optional HTML content
): Promise<void> => {
  try {
    // Read the JSON file containing email addresses
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const { recipients }: { recipients: string[] } = JSON.parse(rawData);

    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('No recipients found in the JSON file.');
    }

    // Send emails to all recipients
    for (const email of recipients) {
      await sendEmail(email, subject, text, html);
    }

    console.log(`Broadcasted emails to ${recipients.length} recipients.`);
  } catch (error) {
    console.error('Error broadcasting emails:', error);
    throw error;
  }
};