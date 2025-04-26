import axios from 'axios';
import { hashPassword, comparePassword } from '../utils/auth';
import {
  createSession,
  invalidateAllSessions,
  invalidateAllExceptCurrent
} from '../utils/sessionClient';
import { UserModel } from '../models/User';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:8085/api/users';

export const registerUser = async (
  email: string,
  password: string,
  userType: string,
  profile: Record<string, any>,
  device: string,
  ip: string
) => {
  const existing = await UserModel.findOne({ email });
  if (existing) throw new Error('Email already exists');

  const hashedPassword = await hashPassword(password);

  // Create local user for auth purposes
  const localUser = new UserModel({
    email,
    password: hashedPassword,
    userType
  });
  await localUser.save();

  // Create user in the User Service with all profile details
  const fullUserData = {
    ...profile,
    email,
    userType
  };

  try {
    // Save in User Service
    const { data: createdUser } = await axios.post(USER_SERVICE_URL, fullUserData);

    console.log('User created in User Service:', createdUser);
    // Create session with the session service
    const session = await createSession(createdUser.id || localUser._id.toString(), ip, device);

    return { 
      userId: createdUser.id || localUser._id.toString(), 
      token: session.token 
    };
  } catch (error: any) {
    // Rollback local user creation if user service registration fails
    await UserModel.deleteOne({ _id: localUser._id });
    throw new Error(`User registration failed: ${error.message}`);
  }
};

export const loginUser = async (
  email: string,
  password: string,
  device: string,
  ip: string
) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error('User not found');

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  // Create session with the session service
  const session = await createSession(user._id.toString(), ip, device);

  return { 
    userId: user._id.toString(), 
    token: session.token 
  };
};

export const forgotPassword = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error('User not found');

  const result = await invalidateAllSessions(user._id.toString());
  return result;
};

export const resetPassword = async (email: string, newPassword: string, ip: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error('User not found');

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  await user.save();

  // Invalidate all sessions except the current one
  const result = await invalidateAllExceptCurrent(user._id.toString(), ip);
  return result;
};
