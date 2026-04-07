import multer from 'multer';

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    'video/mp4', 'video/quicktime', 'video/webm',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 'image/png'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, MOV, WEBM, PDF, DOC, DOCX, JPG, and PNG are allowed.'), false);
  }
};

// Use memoryStorage — files are streamed to Cloudflare R2, not written to disk
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});
