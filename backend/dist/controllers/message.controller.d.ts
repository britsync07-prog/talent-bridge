import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const sendMessage: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMessages: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getChatPartners: (req: AuthRequest, res: Response) => Promise<void>;
