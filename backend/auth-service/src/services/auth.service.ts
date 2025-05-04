import axios from 'axios';
import { hashPassword, comparePassword, generateOtp } from '../utils/auth';
import { UserModel } from '../models/User';
import { createSession } from '../utils/sessionClient';
import { OtpModel } from '../models/Otp';
import { sendEmail } from '../utils/email';
import mongoose from 'mongoose';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:8085/api/users';

export const registerUser = async (
  email: string,
  password: string | undefined,
  userType: string,
  profile: Record<string, any>
) => {
  console.log('RegisterUser Input:', { email, password, userType, profile }); // Debugging log

  // Check if user already exists
  const existing = await UserModel.findOne({ email });
  if (existing) throw new Error('Email already exists');

  // Hash password if provided
  const hashedPassword = password ? await hashPassword(password) : undefined;

  // Create user in the User Service with all profile details
  const fullUserData = {
    ...profile,
    email,
    userType
  };

  try {
    const { data: createdUser } = await axios.post(USER_SERVICE_URL, fullUserData);
    console.log('RegisterUser Created User:', createdUser); 

   
    const localUser = new UserModel({
      _id: new mongoose.Types.ObjectId(createdUser.id),
      email,
      password: hashedPassword,
      userType, 
      userId: createdUser.id 
    });

    await localUser.save();
    console.log('Local auth user created with userType and userId:', localUser.userId);

    return { 
      userId: createdUser.userId
    };
  } catch (userServiceError: any) {
    console.error('RegisterUser Error:', userServiceError); 

    // Specific error handling for debugging
    if (userServiceError.response) {
      console.error('User service error response:', {
        status: userServiceError.response.status,
        data: userServiceError.response.data
      });
      throw new Error(`User registration failed: ${userServiceError.response.data.error || userServiceError.message}`);
    }

    throw new Error(`User registration failed: ${userServiceError.message}`);
  }
};

export const loginUser = async (
  email: string,
  password: string,
  device: string,
  ipAddress: string
) => {
  console.log('LoginUser Input:', { email, password, device, ipAddress }); 

  const user = await UserModel.findOne({ email });
  console.log('LoginUser Found User:', user); 

  if (!user) throw new Error('User not found');

  const valid = await comparePassword(password, user.password!);
  console.log('LoginUser Password Valid:', valid); 

  if (!valid) throw new Error('Invalid credentials');
  
  // Create a session for the user
  try {
    const sessionResult = await createSession(user._id.toString(), ipAddress, device);
    console.log('LoginUser Session Result:', sessionResult); 
    
    // Fix: Ensure userType is treated as string (TypeScript will now know it's not undefined)
    return { 
      userId: user._id.toString(),
      sessionId: sessionResult.sessionId, 
      sessionToken: sessionResult.token,
      userType: user.userType as string // Type assertion to fix TypeScript error
    };
  } catch (error: any) {
    console.error('LoginUser Error:', error); 
    throw new Error('Failed to create session');
  }
};

export const forgotPassword = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error('User not found');

  // Generate a 6-digit OTP
  const otp = generateOtp();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); 

  // Save OTP in database
  await OtpModel.findOneAndUpdate(
    { email },
    { 
      email,
      otp,
      expiresAt
    },
    { upsert: true, new: true }
  );

  try {
    // Send OTP via email utility instead of notification service
    await sendEmail(
      email,
      'Password Reset Verification Code',
      `<h1>Password Reset</h1>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 15 minutes.</p>`
    );

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send OTP email:', error.message);
    throw new Error('Failed to send verification code. Please try again.');
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error('User not found');

  const otpRecord = await OtpModel.findOne({ email });
  if (!otpRecord) throw new Error('No verification code found. Please request a new code.');

  if (otpRecord.otp !== otp) throw new Error('Invalid verification code');

  if (otpRecord.expiresAt < new Date()) throw new Error('Verification code has expired. Please request a new code.');

  // Mark OTP as verified
  otpRecord.verified = true;
  await otpRecord.save();

  return { success: true };
};

export const resetPassword = async (email: string, newPassword: string, ip: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error('User not found');

  // Verify that OTP was verified
  const otpRecord = await OtpModel.findOne({ email, verified: true });
  if (!otpRecord) throw new Error('Please verify your email with the verification code first');

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  await user.save();

  // Delete the OTP record after successful password reset
  await OtpModel.deleteOne({ email });

  // Return basic success message
  return { success: true };
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error('User not found');

  // Verify the current password
  const isPasswordValid = await comparePassword(currentPassword, user.password!);
  if (!isPasswordValid) throw new Error('Current password is incorrect');

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  await user.save();

  return { success: true };
};

/**
 * Check if an email exists in the auth database
 * @param email The email to check
 * @returns Boolean indicating if the email exists
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const user = await UserModel.findOne({ email });
    return !!user; // Return true if user exists, false otherwise
  } catch (error) {
    console.error('Error checking email existence:', error);
    throw new Error('Failed to check email');
  }
};

/**
 * Delete a user from the auth database by their userId
 * This is used when a user is deleted from the user service
 * @param userId The ID of the user to delete
 * @returns Boolean indicating if the deletion was successful
 */
export const deleteUser = async (userId: string): Promise<{ success: boolean, message: string }> => {
  try {
    console.log(`Attempting to delete user with userId: ${userId}`);
    
    // Find the user by userId (which was saved during registration)
    const user = await UserModel.findOne({ userId });
    
    if (!user) {
      console.log(`No user found with userId: ${userId}`);
      return { success: false, message: 'User not found' };
    }
    
    // Delete the user from auth database
    await UserModel.deleteOne({ userId });
    
    console.log(`Successfully deleted auth record for userId: ${userId}`);
    return { 
      success: true, 
      message: 'User authentication details deleted successfully' 
    };
  } catch (error: any) {
    console.error(`Error deleting user auth data: ${error.message}`, error);
    throw new Error(`Failed to delete user authentication details: ${error.message}`);
  }
};

/**
 * Validate a Google token with Google's API
 * @param googleToken The token provided by Google OAuth
 * @returns User information from Google if the token is valid
 */
const verifyGoogleToken = async (googleToken: string) => {
  try {
    // In a production environment, we would verify the token with Google's API
    // For demo purposes, we'll assume the token is valid if it exists
    // In real production, use Google's API to verify: https://developers.google.com/identity/sign-in/web/backend-auth
    
    // This would typically include calling Google's token verification endpoint
    // const response = await axios.get(
    //   `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${googleToken}`
    // );
    // return response.data;
    
    // For now, we'll just return success to avoid external API dependencies
    console.log('Google token verification skipped for demo purposes');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to verify Google token:', error);
    throw new Error('Invalid Google token');
  }
};

/**
 * Handle Google sign-in for existing users
 */
export const googleLogin = async (
  googleToken: string,
  googleId: string,
  email: string,
  device: string,
  ipAddress: string
) => {
  console.log('GoogleLoginUser Input:', { googleToken: '***hidden***', googleId, email, device, ipAddress });
  
  // Verify the Google token
  await verifyGoogleToken(googleToken);

  // Check if user exists in our system
  const user = await UserModel.findOne({ email });
  console.log('GoogleLoginUser Found User:', user);

  if (!user) throw new Error('No account found with this Google email. Please sign up first.');

  // Create a session for the user
  try {
    const sessionResult = await createSession(user._id.toString(), ipAddress, device);
    console.log('GoogleLoginUser Session Result:', sessionResult);
    
    // Fix: Add type assertion to ensure userType is treated as string
    return { 
      userId: user._id.toString(),
      sessionId: sessionResult.sessionId, 
      sessionToken: sessionResult.token,
      userType: user.userType as string // Type assertion to fix TypeScript error
    };
  } catch (error: any) {
    console.error('GoogleLoginUser Error:', error); 
    throw new Error('Failed to create session');
  }
};

/**
 * Register a new user via Google OAuth
 */
export const registerWithGoogle = async (
  googleToken: string,
  googleId: string,
  email: string,
  userType: string,
  profile: Record<string, any>,
  device: string,
  ipAddress: string
) => {
  console.log('RegisterWithGoogle Input:', { 
    googleToken: '***hidden***', 
    googleId, 
    email, 
    userType, 
    profile, 
    device, 
    ipAddress 
  });
  
  // Verify the Google token
  await verifyGoogleToken(googleToken);

  // Check if user already exists
  const existing = await UserModel.findOne({ email });
  if (existing) throw new Error('Email already exists');

  // Create user in the User Service with all profile details
  const fullUserData = {
    ...profile,
    email,
    userType,
    googleId
  };

  try {
    const { data: createdUser } = await axios.post(USER_SERVICE_URL, fullUserData);
    console.log('RegisterWithGoogle Created User:', createdUser);

    // Create a local user record without a password
    const localUser = new UserModel({
      _id: new mongoose.Types.ObjectId(createdUser.id),
      email,
      googleId, // Store the Google ID
      userType,
      userId: createdUser.id
    });

    await localUser.save();
    console.log('Local auth user created for Google account:', localUser.userId);

    return { 
      userId: createdUser.userId || createdUser.id
    };
  } catch (userServiceError: any) {
    console.error('RegisterWithGoogle Error:', userServiceError);

    if (userServiceError.response) {
      console.error('User service error response:', {
        status: userServiceError.response.status,
        data: userServiceError.response.data
      });
      throw new Error(`Google registration failed: ${userServiceError.response.data.error || userServiceError.message}`);
    }

    throw new Error(`Google registration failed: ${userServiceError.message}`);
  }
};
