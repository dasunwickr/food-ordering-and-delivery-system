import axios from 'axios';
import bcryptjs from 'bcryptjs';
import { AuthModel } from '../models/auth.model';
import { User } from '../models/user.model';

const UserServiceURL = process.env.USER_SERVICE_URL || 'http://localhost:8085';

// Register User
export const registerUser = async (email: string, password: string, userData: User) => {
  console.log("Using USER_SERVICE_URL:", UserServiceURL);
  console.log("Incoming registration for:", email);
  console.log("User data:", userData);

  if (!password) {
    throw new Error('Password is required for registration');
  }

  try {
    const userDataWithEmail = { ...userData, email };

    console.log("Sending user creation request to:", `${UserServiceURL}/users`);
    const userResponse = await axios.post(`${UserServiceURL}/users`, userDataWithEmail);
    console.log("User service response:", userResponse.data);

    if (!userResponse.data.id) {
      throw new Error('User creation failed: No ID returned');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log("Password hashed");

    const authUser = new AuthModel({
      email,
      password: hashedPassword,
      userId: userResponse.data.id,
    });

    console.log("Saving user to Auth DB:", authUser);
    await authUser.save();
    console.log("User saved to Auth DB");

    return {
      message: 'User registered successfully',
      userId: userResponse.data.id,
    };
  } catch (error: any) {
    console.error("Error during registration:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw new Error(`Registration failed: ${error.message}`);
  }
};

// Login User
export const loginUser = async (email: string, password: string) => {
  console.log("Attempting login for:", email);

  try {
    const authUser = await AuthModel.findOne({ email });

    if (!authUser) {
      console.warn("No user found with email:", email);
      throw new Error('User not found');
    }

    console.log("User found, verifying password...");
    const isPasswordCorrect = await bcryptjs.compare(password, authUser.password);

    if (!isPasswordCorrect) {
      console.warn("Password mismatch for email:", email);
      throw new Error('Invalid credentials');
    }

    console.log("Login successful for user:", authUser.userId);
    return {
      message: 'Login successful',
      userId: authUser.userId,
    };
  } catch (error: any) {
    console.error("Error during login:", error.message);
    throw new Error(`Login failed: ${error.message}`);
  }
};
