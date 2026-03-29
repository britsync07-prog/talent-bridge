import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const uploadToR2 = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<string> => {
  const key = `${folder}/${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${getExtension(file.originalname)}`;

  const upload = new Upload({
    client: R2,
    params: {
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  });

  await upload.done();

  return `${process.env.R2_PUBLIC_URL}/${key}`;
};

export const deleteFromR2 = async (publicUrl: string): Promise<void> => {
  const base = process.env.R2_PUBLIC_URL!;
  const key = publicUrl.replace(`${base}/`, '');

  await R2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
};

function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
}
