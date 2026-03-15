import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const createTask: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTasksByContract: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateTaskStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
