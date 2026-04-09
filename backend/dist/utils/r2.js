"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromR2 = exports.uploadToR2 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const R2 = new client_s3_1.S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});
const uploadToR2 = async (file, folder = 'uploads') => {
    const key = `${folder}/${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${getExtension(file.originalname)}`;
    const upload = new lib_storage_1.Upload({
        client: R2,
        params: {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        },
    });
    await upload.done();
    return `${process.env.R2_PUBLIC_URL}/${key}`;
};
exports.uploadToR2 = uploadToR2;
const deleteFromR2 = async (publicUrl) => {
    const base = process.env.R2_PUBLIC_URL;
    const key = publicUrl.replace(`${base}/`, '');
    await R2.send(new client_s3_1.DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
    }));
};
exports.deleteFromR2 = deleteFromR2;
function getExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
}
