// @ts-expect-error: No type declarations for 'cloudinary' in Next.js 15
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "rental-properties"
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "auto",
          transformation: [
            { width: 1200, height: 800, crop: "limit", quality: "auto" },
          ],
        },
        (error: Error | undefined, result: unknown) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as CloudinaryUploadResult);
          }
        }
      )
      .end(fileBuffer);
  });
}
