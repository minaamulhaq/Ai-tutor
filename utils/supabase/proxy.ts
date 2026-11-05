import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Updates the Supabase auth session for Next.js proxy.ts requests.
 * Enforces role-based route authorization and redirects across:
 * - Public routes: /, /terms, /privacy, /student/find-teachers, /student/teachers/*
 * - Auth routes: /login, /signup, /forgot-password (redirects already-authenticated users)
 * - Protected student routes: /student, /student/classes, /student/profile, etc.
 * - Protected teacher routes: /teacher, /teacher/classes, /teacher/availability, /teacher/earnings, etc.
 * - Protected admin routes: /admin, /admin/financials, etc.
 * - Onboarding routes: /onboarding
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Helper to construct redirects that preserve all refreshed Supabase cookies
  const redirectWithCookies = (destination: string | URL) => {
    const redirectRes = NextResponse.redirect(new URL(destination, request.url));
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectRes;
  };

  const pathname = request.nextUrl.pathname;

  // 1. Skip route redirection for API routes and webhooks
  // API routes and webhooks handle their own authentication / 401s
  if (pathname.startsWith("/api/")) {
    try {
      await supabase.auth.getUser();
    } catch {
      // Gracefully handle unauthenticated or network failure
    }
    return supabaseResponse;
  }

  // 2. Fetch authenticated user and determine role
  let user: { id: string; user_metadata?: Record<string, any>; app_metadata?: Record<string, any> } | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    }
  } catch {
    user = null;
  }

  let userRole: "student" | "teacher" | "admin" | null = null;
  if (user) {
    userRole =
      (user.user_metadata?.role as "student" | "teacher" | "admin") ||
      (user.app_metadata?.role as "student" | "teacher" | "admin") ||
      null;

    // Fallback: If role wasn't in metadata, query public.users table using supabase client
    if (!userRole) {
      try {
        const { data: dbUser } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (dbUser?.role) {
          userRole = dbUser.role as "student" | "teacher" | "admin";
        }
      } catch {
        // Fallback default below
      }
    }
  }

  const effectiveRole = userRole || "student";

  // 3. Define Route Identifiers
  const isAuthRoute =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/signup/") ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/forgot-password/");

  const isOnboardingRoute =
    pathname === "/onboarding" || pathname.startsWith("/onboarding/");

  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");

  const isTeacherRoute =
    pathname === "/teacher" || pathname.startsWith("/teacher/");

  // Public student discovery pages (marketplace & tutor viewing accessible to all)
  const isPublicStudentDiscovery =
    pathname === "/student/find-teachers" ||
    pathname.startsWith("/student/find-teachers/") ||
    pathname === "/student/teachers" ||
    pathname.startsWith("/student/teachers/");

  // Private student portal (dashboard, classes, messages, profile, payments, settings)
  const isPrivateStudentRoute =
    (pathname === "/student" || pathname.startsWith("/student/")) &&
    !isPublicStudentDiscovery;

  // 4. Authenticated Users visiting Auth Routes (/login, /signup)
  if (user && isAuthRoute) {
    const nextParam = request.nextUrl.searchParams.get("next");
    if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")) {
      if (effectiveRole === "admin") {
        return redirectWithCookies(nextParam);
      }
      if (effectiveRole === "teacher" && !nextParam.startsWith("/admin")) {
        return redirectWithCookies(nextParam);
      }
      if (
        effectiveRole === "student" &&
        !nextParam.startsWith("/teacher") &&
        !nextParam.startsWith("/admin")
      ) {
        return redirectWithCookies(nextParam);
      }
    }

    // Default home dashboard based on role
    if (effectiveRole === "admin") {
      return redirectWithCookies("/admin/financials");
    }
    if (effectiveRole === "teacher") {
      return redirectWithCookies("/teacher");
    }
    return redirectWithCookies("/student");
  }

  // 5. Unauthenticated User Protections
  if (!user) {
    if (isAdminRoute || isTeacherRoute || isPrivateStudentRoute || isOnboardingRoute) {
      const fullPath = pathname + request.nextUrl.search;
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", fullPath);
      return redirectWithCookies(loginUrl.toString());
    }
    return supabaseResponse;
  }

  // 6. Role-Based Access Control (RBAC) for Authenticated Users

  // A. Admin Routes: Only accessible by "admin"
  if (isAdminRoute) {
    if (effectiveRole !== "admin") {
      return redirectWithCookies(
        effectiveRole === "teacher" ? "/teacher" : "/student"
      );
    }
    return supabaseResponse;
  }

  // B. Teacher Routes: Accessible by "teacher" and "admin"
  if (isTeacherRoute) {
    if (effectiveRole !== "teacher" && effectiveRole !== "admin") {
      // Students accessing teacher studio are redirected to student dashboard
      return redirectWithCookies("/student");
    }
    return supabaseResponse;
  }

  // C. Private Student Routes: Accessible by "student" and "admin"
  if (isPrivateStudentRoute) {
    if (effectiveRole !== "student" && effectiveRole !== "admin") {
      // Teachers accessing student portal are redirected to teacher studio
      return redirectWithCookies("/teacher");
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const createClient = updateSession;
