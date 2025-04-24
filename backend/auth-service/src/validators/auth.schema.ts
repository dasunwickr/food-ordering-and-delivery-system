import { z } from 'zod';

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userType: z.string(),
  profile: z.object({
    firstName: z.string(),
    lastName: z.string(),
    contactNumber: z.string(),
    profilePicture: z.string().optional(),
    // Additional fields based on user type
    restaurantName: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    cuisineTypeIds: z.array(z.string()).optional(),
    restaurantTypeId: z.string().optional(),
    vehicleNumber: z.string().optional(),
    vehicleTypeId: z.string().optional(),
    licenseNumber: z.string().optional(),
    // isActive is set by the system, not provided by the user
  }).superRefine((data, ctx) => {
    const userType = (ctx as any).parent.userType; // Explicitly cast or pass userType to avoid error

    if (userType === 'RESTAURANT') {
      if (!data.restaurantName) {
        ctx.addIssue({ code: 'custom', message: 'Restaurant name is required' });
      }
      if (!data.description) {
        ctx.addIssue({ code: 'custom', message: 'Description is required' });
      }
      if (!data.address) {
        ctx.addIssue({ code: 'custom', message: 'Address is required' });
      }
      if (!Array.isArray(data.cuisineTypeIds)) {
        ctx.addIssue({ code: 'custom', message: 'Cuisine types are required' });
      }
      if (!data.restaurantTypeId) {
        ctx.addIssue({ code: 'custom', message: 'Restaurant type is required' });
      }
    }

    if (userType === 'DRIVER') {
      if (!data.vehicleNumber) {
        ctx.addIssue({ code: 'custom', message: 'Vehicle number is required' });
      }
      if (!data.vehicleTypeId) {
        ctx.addIssue({ code: 'custom', message: 'Vehicle type is required' });
      }
      if (!data.licenseNumber) {
        ctx.addIssue({ code: 'custom', message: 'License number is required' });
      }
    }
  }).superRefine((data, ctx) => {
    const userType = (ctx as any).userType; // Explicitly cast or pass userType to avoid error
    
    if (userType === 'RESTAURANT') {
      if (!data.restaurantName) {
        ctx.addIssue({ code: 'custom', message: 'Restaurant name is required' });
      }
      if (!data.description) {
        ctx.addIssue({ code: 'custom', message: 'Description is required' });
      }
      if (!data.address) {
        ctx.addIssue({ code: 'custom', message: 'Address is required' });
      }
      if (!Array.isArray(data.cuisineTypeIds)) {
        ctx.addIssue({ code: 'custom', message: 'Cuisine types are required' });
      }
      if (!data.restaurantTypeId) {
        ctx.addIssue({ code: 'custom', message: 'Restaurant type is required' });
      }
    }
    
    if (userType === 'DRIVER') {
      if (!data.vehicleNumber) {
        ctx.addIssue({ code: 'custom', message: 'Vehicle number is required' });
      }
      if (!data.vehicleTypeId) {
        ctx.addIssue({ code: 'custom', message: 'Vehicle type is required' });
      }
      if (!data.licenseNumber) {
        ctx.addIssue({ code: 'custom', message: 'License number is required' });
      }
    }
  }),
  device: z.string(),
  ipAddress: z.string()
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  device: z.string(),
  ipAddress: z.string()
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email()
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(6),
  ipAddress: z.string()
});
