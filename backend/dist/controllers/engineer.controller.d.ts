import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const matchEngineers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getEngineers: (req: Request, res: Response) => Promise<void>;
export declare const getEngineerById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
