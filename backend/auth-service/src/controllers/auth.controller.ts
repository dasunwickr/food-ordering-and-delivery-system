import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { LoginSchema, RegisterSchema } from '../validators/auth.schema';


export const register = async (req: Request, res: Response) => {
  try {
    const parsed = RegisterSchema.parse(req.body);
    const { email, password } = parsed;

    console.log("Registering user with email:", email);
    
    const userData = { ...parsed };

    const result = await registerUser(email, password, userData);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Register controller error:", error.message);

    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }

    return res.status(500).json({ error: error.message });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.parse(req.body);
    const { email, password } = parsed;

    console.log("Attempting login for:", email);

    const result = await loginUser(email, password);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Login controller error:", error.message);

    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }

    return res.status(401).json({ error: error.message });
  }
};
