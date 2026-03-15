import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const registerEmployer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const registerEngineer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMe: (req: AuthRequest, res: Response) => Promise<void>;
