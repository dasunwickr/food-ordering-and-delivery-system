import { z } from 'zod';

export const RegisterSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  address: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  email: z.string().email(),
  password: z.string().min(6), // ✅ required for registration
  contactNumber: z.string().min(10),
  userType: z.enum(['admin', 'customer', 'driver', 'restaurantOwner']),
  roleType: z.optional(z.string().min(3)),  // Only for Admin
  orderHistory: z.optional(z.array(z.string())), // Only for Customer
  vehicleType: z.optional(z.string()),  // Only for Driver
  vehicleNumber: z.optional(z.string()),  // Only for Driver
  availabilityStatus: z.optional(z.boolean()),  // Only for Driver
  assignedOrders: z.optional(z.array(z.string())),  // Only for Driver
  restaurantName: z.optional(z.string()), // Only for RestaurantOwner
  restaurantAddress: z.optional(z.string()), // Only for RestaurantOwner
  restaurantLicenseNumber: z.optional(z.string()), // Only for RestaurantOwner
  restaurantDocuments: z.optional(z.string()) // Only for RestaurantOwner
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
