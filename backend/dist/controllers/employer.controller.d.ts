import { Response } from 'express';
export declare const getEmployerProfile: (req: any, res: Response) => Promise<void>;
export declare const updateEmployerProfile: (req: any, res: Response) => Promise<void>;
export declare const getEmployerStats: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSavedCandidates: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUpcomingInterviews: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
