// Unsigned upload straight from the browser — same Cloudinary account, cloud
// name and upload preset as the Flutter app's CloudinaryService, so images
// posted from either platform land in the same media library.
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "h9abl4nh";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "hybridfit";

export const CLOUDINARY_BANNER_FOLDER = "hybridfit/banners";
export const CLOUDINARY_NOTIFICATION_FOLDER = "hybridfit/notifications";

export async function uploadImage(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Image upload failed. Please try again.");
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) throw new Error("Cloudinary did not return an image URL.");
  return data.secure_url;
}
