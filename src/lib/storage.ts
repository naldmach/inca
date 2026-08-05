import { createAdminClient } from "./supabase/admin";

export const PROPERTY_IMAGE_BUCKET = "property-images";

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadPropertyImage(
  file: File,
  folder: string = "properties"
): Promise<UploadResult> {
  const supabase = createAdminClient();

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(PROPERTY_IMAGE_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(PROPERTY_IMAGE_BUCKET)
    .getPublicUrl(path);

  return { url: data.publicUrl, path };
}
