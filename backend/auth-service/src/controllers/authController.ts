import * as authService from "../services/authService";
import { Request, Response } from 'express';

export const signup = (req: Request, res: Response) => authService.signup(req, res);
export const login = (req: Request, res: Response) => authService.login(req, res);
export const forgotPassword = (req: Request, res: Response) => authService.forgotPassword(req, res);
export const resetPassword = (req: Request, res: Response) => authService.resetPassword(req, res);