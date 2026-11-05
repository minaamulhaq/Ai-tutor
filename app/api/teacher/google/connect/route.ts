import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateGoogleOAuthUrl } from "@/lib/google/calendar";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.getUser();

  if (error || !authData.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", "/teacher/settings");
    return NextResponse.redirect(loginUrl);
  }

  const teacherId = authData.user.id;
  const origin = request.nextUrl.origin;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/teacher/google/callback`;

  // Validate that Google OAuth environment variables are configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    const settingsUrl = new URL("/teacher/settings", request.url);
    settingsUrl.searchParams.set(
      "google_error",
      "Missing Google OAuth Credentials. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file."
    );
    return NextResponse.redirect(settingsUrl);
  }

  const { url } = generateGoogleOAuthUrl(teacherId, redirectUri);

  return NextResponse.redirect(url);
}
