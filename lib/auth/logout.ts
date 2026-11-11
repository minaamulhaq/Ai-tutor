import { createClient } from "@/utils/supabase/client";
import { signOutAction } from "@/app/actions/authActions";

/**
 * Handles complete client and server-side sign out:
 * 1. Revokes local and remote Supabase session via browser client.
 * 2. Clears sessionStorage and localStorage tokens.
 * 3. Clears HttpOnly and browser session cookies via Server Action.
 * 4. Redirects to /login to clear all in-memory React state and browser caches.
 */
export async function performSignOut(redirectTo: string = "/login"): Promise<void> {
  // 1. Client-side Supabase sign out
  try {
    const supabase = createClient();
    await supabase.auth.signOut().catch(() => {});
  } catch (err) {
    console.warn("Client sign out error:", err);
  }

  // 2. Clear client storage
  if (typeof window !== "undefined") {
    try {
      sessionStorage.clear();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("sb-") || key.includes("supabase"))) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // ignore storage access errors
    }
  }

  // 3. Server Action cookie clearing and redirect
  try {
    await signOutAction(redirectTo);
  } catch {
    // If NEXT_REDIRECT or an error is caught on client, fallback to browser navigation
    if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
  }
}
