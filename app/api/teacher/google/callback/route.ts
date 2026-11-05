import { NextRequest, NextResponse } from "next/server";
import { verifyGoogleOAuthState, handleGoogleOAuthCallback } from "@/lib/google/calendar";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const settingsUrl = new URL("/teacher/settings", request.url);

  if (error) {
    settingsUrl.searchParams.set("google_error", error);
    return NextResponse.redirect(settingsUrl);
  }

  if (!code || !state) {
    settingsUrl.searchParams.set("google_error", "missing_code_or_state");
    return NextResponse.redirect(settingsUrl);
  }

  // 1. Verify state signature and expiration
  const stateResult = verifyGoogleOAuthState(state);
  if (!stateResult.isValid || !stateResult.teacherId) {
    settingsUrl.searchParams.set("google_error", "invalid_state");
    return NextResponse.redirect(settingsUrl);
  }

  const origin = request.nextUrl.origin;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/teacher/google/callback`;

  try {
    // 2. Exchange authorization code for tokens and save to database
    await handleGoogleOAuthCallback(code, redirectUri, stateResult.teacherId);
    settingsUrl.searchParams.set("google", "connected");
    return NextResponse.redirect(settingsUrl);
  } catch (err: any) {
    console.error("Google OAuth callback error:", err);
    settingsUrl.searchParams.set("google_error", encodeURIComponent(err?.message || "oauth_failed"));
    return NextResponse.redirect(settingsUrl);
  }
}
