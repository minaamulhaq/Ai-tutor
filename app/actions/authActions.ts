"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server Action to securely sign the user out of Supabase across both
 * the authentication server and HTTP cookie store, then redirect to login.
 */
export async function signOutAction(redirectUrl: string = "/login") {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "global" });
  } catch (err) {
    console.warn("Server-side sign out encountered an issue:", err);
  }

  // Explicitly clear any lingering Supabase auth cookies
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      if (
        cookie.name.startsWith("sb-") ||
        cookie.name.includes("auth-token") ||
        cookie.name.includes("supabase")
      ) {
        cookieStore.delete(cookie.name);
      }
    }
  } catch {
    // Ignore cookie deletion errors in server component context
  }

  redirect(redirectUrl);
}
