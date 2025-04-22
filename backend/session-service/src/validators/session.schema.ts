import { z } from 'zod';

export const CreateSessionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  device: z.string().min(1, "Device name is required"),
  macAddress: z.string().min(1, "MAC Address is required"),
});

export const UpdateSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});
