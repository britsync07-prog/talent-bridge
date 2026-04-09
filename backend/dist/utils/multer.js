"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'video/mp4', 'video/quicktime', 'video/webm',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg', 'image/png'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only MP4, MOV, WEBM, PDF, DOC, DOCX, JPG, and PNG are allowed.'), false);
    }
};
// Use memoryStorage — files are streamed to Cloudflare R2, not written to disk
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
    },
});
