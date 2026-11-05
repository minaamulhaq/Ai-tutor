/**
 * Avatar Upload & Supabase Storage Service
 *
 * Implements Option A:
 * 1. Takes the user's raw photo file.
 * 2. Compresses it to a 400x400 px WebP via client-side HTML Canvas.
 * 3. Uploads directly to Supabase Storage public bucket 'avatars'.
 * 4. Falls back gracefully to server endpoint (/api/uploads/avatar) if direct client upload fails or keys are local.
 */

import { createClient } from "@/lib/client";
import { compressAvatarImage } from "./imageCompressor";

export interface AvatarUploadResult {
  url: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: string;
  storageProvider: "supabase" | "local_fallback";
}

export async function uploadUserAvatar(
  file: File,
  userId: string = "user"
): Promise<AvatarUploadResult> {
  // 1. Client-Side Canvas Compression (WebP, 400x400, 1:1 Square Crop)
  const compressed = await compressAvatarImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.85,
    cropSquare: true,
  });

  const uniqueFileName = `${userId}/${Date.now()}_avatar.webp`;
  const supabase = createClient();

  try {
    // 2. Direct upload to Supabase Storage 'avatars' bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(uniqueFileName, compressed.blob, {
        contentType: "image/webp",
        cacheControl: "31536000", // 1 year edge cache
        upsert: true,
      });

    if (uploadError) {
      console.warn("Supabase Storage direct upload encountered an issue, falling back to server handler:", uploadError.message);
      throw uploadError;
    }

    // 3. Get Public URL from Supabase
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(uniqueFileName);

    return {
      url: publicUrlData.publicUrl,
      originalSizeBytes: compressed.originalSizeBytes,
      compressedSizeBytes: compressed.compressedSizeBytes,
      compressionRatio: compressed.compressionRatio,
      storageProvider: "supabase",
    };
  } catch (err: any) {
    // 4. Graceful Fallback: Upload through /api/uploads/avatar
    console.info("Routing upload through /api/uploads/avatar fallback endpoint...");

    const formData = new FormData();
    formData.append("file", compressed.file);
    formData.append("userId", userId);

    const res = await fetch("/api/uploads/avatar", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      // In offline/demo mode, use the high-quality local preview blob so UI updates seamlessly
      console.warn("Local fallback endpoint unavailable, using compressed client blob URL.");
      return {
        url: compressed.previewUrl,
        originalSizeBytes: compressed.originalSizeBytes,
        compressedSizeBytes: compressed.compressedSizeBytes,
        compressionRatio: compressed.compressionRatio,
        storageProvider: "local_fallback",
      };
    }

    const json = await res.json();
    return {
      url: json.url || compressed.previewUrl,
      originalSizeBytes: compressed.originalSizeBytes,
      compressedSizeBytes: compressed.compressedSizeBytes,
      compressionRatio: compressed.compressionRatio,
      storageProvider: json.storageProvider || "local_fallback",
    };
  }
}
