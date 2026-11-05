import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";
import { ensureAvatarBucketExists } from "@/app/actions/student";

export const dynamic = "force-dynamic";

const MAX_AVATAR_SIZE = 8 * 1024 * 1024; // 8 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = (formData.get("userId") as string) || "user";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json({ error: "Avatar file exceeds 8MB limit." }, { status: 400 });
    }

    // Verify it is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images are permitted for avatars." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeHash = crypto.randomBytes(6).toString("hex");
    const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    const fileName = `${safeUserId}/${Date.now()}_${safeHash}.webp`;

    // 1. Primary Strategy: Upload directly into Supabase Storage 'avatars' Bucket
    try {
      await ensureAvatarBucketExists();
      const supabase = await createClient();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, buffer, {
          contentType: file.type || "image/webp",
          cacheControl: "31536000",
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            storageProvider: "supabase",
          });
        }
      } else if (uploadError) {
        console.warn("Supabase Storage bucket upload warning, attempting fallback:", uploadError.message);
      }
    } catch (storageErr) {
      console.warn("Storage upload exception, routing to local disk fallback:", storageErr);
    }

    // 2. Fallback Strategy: Save locally into public/uploads/avatars
    const avatarsDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(avatarsDir, { recursive: true });

    const localFileName = `${safeUserId}_${Date.now()}_${safeHash}.webp`;
    const filePath = path.join(avatarsDir, localFileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/avatars/${localFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      storageProvider: "local_fallback",
    });
  } catch (error: any) {
    console.error("Avatar upload handler error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process avatar upload." },
      { status: 500 }
    );
  }
}
