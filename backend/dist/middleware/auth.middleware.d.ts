import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: any;
}
export declare const protect: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const admin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const employer: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const engineer: (req: AuthRequest, res: Response, next: NextFunction) => void;
