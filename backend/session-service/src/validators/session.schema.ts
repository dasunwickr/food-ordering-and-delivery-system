import { z } from 'zod';

// Zod validation schema for creating session
export const CreateSessionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  device: z.string().min(1, "Device name is required"),
  macAddress: z.string().min(1, "MAC Address is required"),
});

// Zod validation schema for updating session
export const UpdateSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});
