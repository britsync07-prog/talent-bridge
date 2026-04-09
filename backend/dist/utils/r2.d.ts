export declare const uploadToR2: (file: Express.Multer.File, folder?: string) => Promise<string>;
export declare const deleteFromR2: (publicUrl: string) => Promise<void>;
