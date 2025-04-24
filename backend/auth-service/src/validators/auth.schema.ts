import { z } from 'zod';

export const SignUpSchema = z.object({
  // Common fields
  email: z.string().email(),
  password: z.string().min(6),
  userType: z.string(),
  profile: z.object({
    firstName: z.string(),
    lastName: z.string(),
    contactNumber: z.string(),
    profilePictureUrl: z.string().optional(),

    // Customer, Restaurant, Driver specific fields
    location: z.object({
      lat: z.number().optional(),
      lng: z.number().optional()
    }).optional(),

    // Restaurant and Driver specific fields
    isActive: z.boolean().optional(),

    // Restaurant specific fields
    restaurantName: z.string().optional(),
    restaurantLicenseNumber: z.string().optional(),
    restaurantTypeId: z.string().optional(),
    cuisineTypeIds: z.array(z.string()).optional(),
    restaurantDocuments: z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      url: z.string().optional()
    }),
    restaurantAddress: z.string().optional(),
    openingTime:z.array( z.object({
      day: z.string().optional(),
      openingTime: z.string().optional(),
      closingTime: z.string().optional(),
      isOpen: z.boolean().optional()
    })),
    restaurantStatus: z.string().optional(),

    // Driver specific fields
    vehicleTypeId: z.string().optional(),
    vehicleNumber: z.string().optional(),
    vehicleDocuments: z.array(z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      url: z.string().optional()
    })),
    driverStatus: z.string().optional(),

  

  }).superRefine((data, ctx) => {
    const userType = (ctx as any).parent.userType; 

    if (userType === 'RESTAURANT') {
      if (!data.restaurantName) {
        ctx.addIssue({ code: 'custom', message: 'Restaurant name is required' });
      }
      if (!data.restaurantAddress) {
        ctx.addIssue({ code: 'custom', message: 'Restaurant address is required' });
      }
      if (!data.restaurantLicenseNumber) {
        ctx.addIssue({ code: 'custom', message: 'Restaurant license number is required' });
      }
      if (!Array.isArray(data.cuisineTypeIds) || data.cuisineTypeIds.length === 0) {
        ctx.addIssue({ code: 'custom', message: 'Cuisine types are required' });
      }
      if (!data.restaurantTypeId) {
        ctx.addIssue({ code: 'custom', message: 'Restaurant type is required' });
      }
      if (!Array.isArray(data.openingTime) || data.openingTime.length === 0) {
        ctx.addIssue({ code: 'custom', message: 'Opening hours are required' });
      }
    }

    if (userType === 'DRIVER') {
      if (!data.vehicleNumber) {
        ctx.addIssue({ code: 'custom', message: 'Vehicle number is required' });
      }
      if (!data.vehicleTypeId) {
        ctx.addIssue({ code: 'custom', message: 'Vehicle type is required' });
      }
      if (!Array.isArray(data.vehicleDocuments) || data.vehicleDocuments.length === 0) {
        ctx.addIssue({ code: 'custom', message: 'Vehicle documents are required' });
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
