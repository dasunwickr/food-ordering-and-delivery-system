import { Request, Response } from 'express';
import { login, signUp } from '../services/auth.service';

export async function signUpHandler(req: Request, res: Response) {
  try {
    const user = await signUp(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const { token, user } = await login(username, password);
    res.status(200).json({ token, user });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
}