import axios from 'axios';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();



const API_URL = 'https://app.notify.lk/api/v1/send';

export async function sendSMS(phoneNumber: string, message: string): Promise<void> {
  const apiKey = process.env.NOTIFY_API_KEY;
  const senderId = process.env.NOTIFY_SENDER_ID;
  const userId = process.env.NOTIFY_USER_ID;

  if (!apiKey || !senderId) {
    throw new Error('API Key or Sender ID is missing');
  }

  try {
    const response = await axios.post(API_URL, null, {
      params: {
        user_id: userId,
        api_key: apiKey,
        sender_id: senderId,
        to: phoneNumber,
        message,
      },
    });

    if (response.data.status === 'success') {
      console.log(`[SMS] Sent to ${phoneNumber}:`, response.data);
    } else {
      console.error(`[SMS] Failed to send to ${phoneNumber}:`, response.data);
      throw new Error('Failed to send SMS via Notify.lk API');
    }
  } catch (error) {
    console.error(`[SMS] Error sending to ${phoneNumber}:`, error);
    throw error;
  }
}

const emailTransporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email service provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(email: string, subject: string, text: string, html?: string): Promise<void> {
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text, // Plain text fallback
      html, // Optional HTML content
    });
    console.log(`[EMAIL] Sent to ${email}: ${subject}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send to ${email}:`, error);
    throw error;
  }
}