import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedMessagingUser } from "@/app/actions/messageActions";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Disallowed dangerous extensions
const DANGEROUS_EXTENSIONS = new Set([
  ".exe", ".bat", ".cmd", ".sh", ".bash", ".bin", ".msi", ".vbs", ".ps1", ".jar", ".app", ".com", ".pif", ".scr"
]);

// Allowed MIME types
const ALLOWED_MIME_PREFIXES = ["image/", "application/pdf", "text/", "application/msword", "application/vnd.openxmlformats-officedocument", "application/zip", "application/x-zip-compressed"];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedMessagingUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 15MB size limit." }, { status: 400 });
    }

    const originalName = file.name || "attachment";
    const ext = path.extname(originalName).toLowerCase();

    if (DANGEROUS_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Executable or potentially harmful files are strictly forbidden." },
        { status: 400 }
      );
    }

    // Determine clean file type
    let fileType: "image" | "pdf" | "doc" | "zip" | "other" = "other";
    if (file.type.startsWith("image/") || [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext)) {
      fileType = "image";
    } else if (file.type === "application/pdf" || ext === ".pdf") {
      fileType = "pdf";
    } else if (ext === ".doc" || ext === ".docx" || ext === ".txt") {
      fileType = "doc";
    } else if (ext === ".zip" || ext === ".rar") {
      fileType = "zip";
    }

    // Write file to public/uploads/messages directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "messages");
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeHash = crypto.randomBytes(8).toString("hex");
    const safeBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
    const uniqueFileName = `${Date.now()}_${safeHash}_${safeBaseName}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/messages/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      attachment: {
        name: originalName,
        url: fileUrl,
        fileType,
        sizeBytes: file.size,
        mimeType: file.type || "application/octet-stream",
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error?.message || "File upload failed" }, { status: 500 });
  }
}
