import * as authService from "../services/authService";
import { Request, Response, NextFunction } from 'express';

export const signup = (req: Request, res: Response, next: NextFunction) => authService.signup(req, res, next);
export const login = (req: Request, res: Response, next: NextFunction) => authService.login(req, res, next);
export const forgotPassword = (req: Request, res: Response, next: NextFunction) => authService.forgotPassword(req, res, next);
export const resetPassword = (req: Request, res: Response, next: NextFunction) => authService.resetPassword(req, res, next);