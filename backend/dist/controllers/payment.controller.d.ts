import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const generateInvoice: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCheckoutSession: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const handleWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyInvoices: (req: AuthRequest, res: Response) => Promise<void>;
