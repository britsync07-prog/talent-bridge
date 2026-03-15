import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getMyContracts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getContractById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const signContract: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const declineContract: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
