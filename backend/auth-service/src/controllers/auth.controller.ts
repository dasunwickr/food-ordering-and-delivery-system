import { Request, Response } from 'express';
import { SignUpSchema, SignInSchema, ForgotPasswordSchema, ResetPasswordSchema } from '../validators/auth.schema';
import * as AuthService from '../services/auth.service';
import { sendEmail } from '../utils/email';

export const signUp = async (req: Request, res: Response) => {
  try {
    const validationResult = SignUpSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      // Format Zod validation errors for better client-side handling
      const formattedErrors = validationResult.error.format();
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: formattedErrors
      });
    }
    
    const { email, password, userType, profile } = validationResult.data;
    let userPassword = password;

    if (userPassword != undefined && userPassword.length < 1) {
      userPassword = undefined;
    }

    console.log('SignUp Request Data:', { email, userPassword, userType, profile }); // Debugging log

    // Register the user and get the result containing userId
    const result = await AuthService.registerUser(email, userPassword, userType, profile);

    console.log('SignUp Result:', result); // Debugging log

    // Save userId and userType explicitly in the auth database (if not already handled)
    res.status(201).json({ 
      message: 'User registered', 
      userId: result.userId, 
      userType: userType 
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    // Check for specific error types to provide better messages
    if (err.message.includes('Email already exists')) {
      return res.status(400).json({ error: 'Email already in use. Please use a different email address.' });
    }
    res.status(400).json({ error: err.message });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password, device, ipAddress } = SignInSchema.parse(req.body);

    console.log('SignIn Request Data:', { email, password, device, ipAddress }); 

    const result = await AuthService.loginUser(email, password, device, ipAddress);

    console.log('SignIn Result:', result);

    res.status(200).json({ 
      message: 'Logged in successfully', 
      userId: result.userId,
      sessionId: result.sessionId,
      token: result.sessionToken,
      userType: result.userType 
    });
  } catch (err: any) {
    console.error('SignIn error:', err); 
    res.status(400).json({ error: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = ForgotPasswordSchema.parse(req.body);
    const result = await AuthService.forgotPassword(email);
    res.status(200).json({ message: 'Password reset request processed', ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
       return res.status(400).json({ error: 'Email and OTP are required' });
    }
    const result = await AuthService.verifyOtp(email, otp);
    res.status(200).json({ message: 'OTP verified successfully', ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, ipAddress } = ResetPasswordSchema.parse(req.body);
    const result = await AuthService.resetPassword(email, newPassword, ipAddress);
    res.status(200).json({ message: 'Password reset successful', ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Send an email with custom content
 * Used for system notifications and custom emails
 */
export const sendCustomEmail = async (req: Request, res: Response) => {
  try {
    const { to, subject, content } = req.body;
    
    // Validate required fields
    if (!to || !subject || !content) {
       return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, content' 
      });
    }

    // Send the email
    await sendEmail(to, subject, content);
    
    //  success response
    res.status(200).json({ 
      success: true, 
      message: `Email sent successfully to ${to}` 
    });
  } catch (error: any) {
    console.error('Failed to send email:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to send email: ${error.message}` 
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields: userId, currentPassword, newPassword' });
    }

    // Call the service to change the password
    const result = await AuthService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({ message: 'Password changed successfully', ...result });
  } catch (err: any) {
    console.error('Error changing password:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Check if an email exists in the system
 * Used by signup and signin forms to validate emails
 */
export const checkEmailExists = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email parameter is required' 
      });
    }
    
    const exists = await AuthService.checkEmailExists(email);
    
    res.status(200).json({ exists });
  } catch (error: any) {
    console.error('Error checking email existence:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to check email: ${error.message}` 
    });
  }
};

/**
 * Delete a user's authentication details
 * This endpoint is called when a user is deleted from the user service
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'UserId parameter is required' 
      });
    }
    
    const result = await AuthService.deleteUser(userId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error: any) {
    console.error('Error deleting user auth details:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to delete user: ${error.message}` 
    });
  }
};

/**
 * Handle Google OAuth sign-in
 * This endpoint validates Google tokens and creates a session
 */
export const googleSignIn = async (req: Request, res: Response) => {
  try {
    const { googleToken, googleId, email, device, ipAddress } = req.body;
    
    if (!googleToken || !googleId || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: googleToken, googleId, email' 
      });
    }
    
    // Call the service to handle Google sign-in
    const result = await AuthService.googleLogin(googleToken, googleId, email, device, ipAddress);
    
    res.status(200).json({ 
      message: 'Google sign-in successful', 
      userId: result.userId,
      sessionId: result.sessionId,
      token: result.sessionToken,
      userType: result.userType 
    });
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Handle specific error cases with appropriate status codes
    if (error.message.includes('User not found') || error.message.includes('No account found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Invalid token') || error.message.includes('Authentication failed')) {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(400).json({ 
      success: false, 
      error: `Failed to authenticate with Google: ${error.message}` 
    });
  }
};

/**
 * Handle Google OAuth sign-up
 * This endpoint validates Google tokens and creates a new user account
 */
export const googleSignUp = async (req: Request, res: Response) => {
  try {
    const { googleToken, googleId, email, userType, profile, device, ipAddress } = req.body;
    
    if (!googleToken || !googleId || !email || !userType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: googleToken, googleId, email, userType' 
      });
    }
    
    // Call the service to handle Google sign-up
    const result = await AuthService.registerWithGoogle(
      googleToken, 
      googleId, 
      email, 
      userType, 
      profile || {}, 
      device, 
      ipAddress
    );
    
    res.status(201).json({ 
      message: 'Google sign-up successful', 
      userId: result.userId,
      userType 
    });
  } catch (error: any) {
    console.error('Google sign-up error:', error);
    
    // Handle specific error cases with appropriate status codes
    if (error.message.includes('already exists') || error.message.includes('already registered')) {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes('Invalid token') || error.message.includes('Authentication failed')) {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(400).json({ 
      success: false, 
      error: `Failed to register with Google: ${error.message}` 
    });
  }
};
