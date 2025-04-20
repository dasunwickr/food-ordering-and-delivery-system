import { z } from 'zod';

export const RegisterSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  address: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  email: z.string().email(),
  password: z.string().min(6), 
  contactNumber: z.string().min(10),
  userType: z.enum(['admin', 'customer', 'driver', 'restaurantOwner']),
  roleType: z.optional(z.string().min(3)), 
  orderHistory: z.optional(z.array(z.string())), 
  vehicleType: z.optional(z.string()),  
  vehicleNumber: z.optional(z.string()),  
  availabilityStatus: z.optional(z.boolean()),  
  assignedOrders: z.optional(z.array(z.string())),  
  restaurantName: z.optional(z.string()), 
  restaurantAddress: z.optional(z.string()),
  restaurantLicenseNumber: z.optional(z.string()),
  restaurantDocuments: z.optional(z.string()) 
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
