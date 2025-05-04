import axios from 'axios';
import { hashPassword, comparePassword, generateOtp } from '../utils/auth';
import { UserModel } from '../models/User';
import { createSession } from '../utils/sessionClient';
import { OtpModel } from '../models/Otp';
import { sendEmail } from '../utils/email';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:8085/api/users';

export const registerUser = async (
  email: string,
  password: string,
  userType: string,
  profile: Record<string, any>
) => {
  console.log('RegisterUser Input:', { email, password, userType, profile }); // Debugging log

  // Check if user already exists
  const existing = await UserModel.findOne({ email });
  if (existing) throw new Error('Email already exists');

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user in the User Service with all profile details
  const fullUserData = {
    ...profile,
    email,
    userType
  };

  try {
    // Save in User Service
    const { data: createdUser } = await axios.post(USER_SERVICE_URL, fullUserData);
    console.log('RegisterUser Created User:', createdUser); // Debugging log

    // Ensure userType and userId are saved in the local auth database
    const localUser = new UserModel({
      email,
      password: hashedPassword,
      userType, // Save userType explicitly
      userId: createdUser.id // Save userId explicitly
    });

    await localUser.save();
    console.log('Local auth user created with userType and userId:', localUser._id);

    return { 
      userId: createdUser.id
    };
  } catch (userServiceError: any) {
    console.error('RegisterUser Error:', userServiceError); // Debugging log

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
  console.log('LoginUser Input:', { email, password, device, ipAddress }); // Debugging log

  const user = await UserModel.findOne({ email });
  console.log('LoginUser Found User:', user); // Debugging log

  if (!user) throw new Error('User not found');

  const valid = await comparePassword(password, user.password);
  console.log('LoginUser Password Valid:', valid); // Debugging log

  if (!valid) throw new Error('Invalid credentials');
  
  // Create a session for the user
  try {
    const sessionResult = await createSession(user._id.toString(), ipAddress, device);
    console.log('LoginUser Session Result:', sessionResult); // Debugging log
    
    return { 
      userId: user._id.toString(),
      sessionId: sessionResult.sessionId, 
      sessionToken: sessionResult.token,
      userType: user.userType // Make sure to return the userType
    };
  } catch (error: any) {
    console.error('LoginUser Error:', error); // Debugging log
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
  const isPasswordValid = await comparePassword(currentPassword, user.password);
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
