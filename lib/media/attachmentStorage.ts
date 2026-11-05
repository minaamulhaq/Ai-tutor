/**
 * Message Attachment Storage Uploader
 *
 * Uploads message attachments (images, PDFs, documents, archives) directly to
 * Supabase Storage ('messages' or 'avatars' bucket) with local fallback.
 * Generates public/downloadable CDN URLs.
 */

import { createClient } from "@/lib/client";

export interface UploadedAttachment {
  name: string;
  url: string;
  fileType: "image" | "pdf" | "doc" | "zip" | "other";
  sizeBytes: number;
  mimeType: string;
}

const DANGEROUS_EXTENSIONS = new Set([
  ".exe", ".bat", ".cmd", ".sh", ".bash", ".bin", ".msi", ".vbs", ".ps1", ".jar", ".app"
]);

export function detectFileType(file: File): "image" | "pdf" | "doc" | "zip" | "other" {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (file.type.startsWith("image/") || [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) {
    return "image";
  }
  if (file.type === "application/pdf" || ext === ".pdf") {
    return "pdf";
  }
  if (
    ext === ".doc" ||
    ext === ".docx" ||
    ext === ".txt" ||
    ext === ".rtf" ||
    ext === ".odt" ||
    file.type.includes("word") ||
    file.type.includes("document")
  ) {
    return "doc";
  }
  if (ext === ".zip" || ext === ".rar" || ext === ".7z" || ext === ".tar" || ext === ".gz") {
    return "zip";
  }
  return "other";
}

export async function uploadMessageAttachment(
  file: File,
  conversationId: string
): Promise<UploadedAttachment> {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    throw new Error(`File type "${ext}" is unsafe and cannot be uploaded.`);
  }

  const fileType = detectFileType(file);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniquePath = `${conversationId}/${Date.now()}_${safeName}`;
  const supabase = createClient();

  // 1. Attempt upload to Supabase Storage ('messages' bucket or fallback to 'avatars')
  const targetBuckets = ["messages", "avatars"];

  for (const bucket of targetBuckets) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(uniquePath, file, {
          contentType: file.type || "application/octet-stream",
          cacheControl: "31536000",
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(uniquePath);

        return {
          name: file.name,
          url: publicUrlData.publicUrl,
          fileType,
          sizeBytes: file.size,
          mimeType: file.type || "application/octet-stream",
        };
      }
    } catch {
      // Continue to next bucket or server fallback
    }
  }

  // 2. Fallback to /api/messages/upload if Supabase direct bucket upload is restricted
  const formData = new FormData();
  formData.append("file", file);
  formData.append("conversationId", conversationId);

  const res = await fetch("/api/messages/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to upload "${file.name}"`);
  }

  const json = await res.json();
  return json.attachment;
}
