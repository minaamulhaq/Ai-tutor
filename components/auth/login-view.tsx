"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Clock,
  TrendingUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
  BookOpen,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type UserRole = "student" | "teacher";

export function LoginView() {
  const router = useRouter();

  // Form State
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status & Validation States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. name@example.com).");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      // Read role and onboarding status from user metadata
      const userRole = (data?.user?.user_metadata?.role as UserRole) || role;
      const isOnboarded = data?.user?.user_metadata?.isOnboarded;

      // Check for returnUrl / next query parameter (e.g. /login?next=/teacher/availability)
      let nextTarget: string | null = null;
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const candidate = urlParams.get("next");
        if (candidate && candidate.startsWith("/") && !candidate.startsWith("//")) {
          nextTarget = candidate;
        }
      }

      let destination = !isOnboarded
        ? `/onboarding?role=${userRole}`
        : userRole === "teacher"
        ? "/teacher"
        : "/student";

      // If already onboarded and a valid redirect target exists that matches the user's role
      if (isOnboarded && nextTarget) {
        if (userRole === "teacher" && !nextTarget.startsWith("/admin")) {
          destination = nextTarget;
        } else if (
          userRole === "student" &&
          !nextTarget.startsWith("/teacher") &&
          !nextTarget.startsWith("/admin")
        ) {
          destination = nextTarget;
        }
      }

      setSuccessMessage(
        !isOnboarded
          ? `Welcome! Let's complete your ${userRole} profile setup...`
          : `Welcome back! Redirecting to your ${userRole} studio...`
      );

      setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      console.error("Login submission error:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please check your network and credentials."
      );
      setIsLoading(false);
    }
  };

  // Demo autofill for rapid pair-testing
  const handleQuickDemoFill = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === "student") {
      setEmail("sarah.jenkins@example.com");
      setPassword("password123");
    } else {
      setEmail("alexander.wright@zuhdemy.com");
      setPassword("password123");
    }
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row antialiased text-[#172033] selection:bg-orange-100 selection:text-orange-900">
      {/* =================================================================== */}
      {/* LEFT PANEL: 52% WIDTH - BRAND VALUE & WARM ILLUSTRATION            */}
      {/* =================================================================== */}
      <div className="w-full lg:w-[52%] bg-[#FFFBF8] border-r border-[#F3E8E2] flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-20 relative overflow-hidden">
        {/* Subtle Decorative Background Rings */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-orange-200/25 via-amber-100/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gradient-to-tr from-orange-100/30 via-amber-50/20 to-transparent blur-2xl pointer-events-none" />

        {/* 1. Top: Logo and Tagline */}
        <div className="relative z-10 space-y-1">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="relative size-10 rounded-2xl bg-[#FF6B0A] text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="size-5.5 text-white" />
              <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#172033]">
              Zuh<span className="text-[#FF6B0A]">Demy</span>
            </span>
          </Link>
          <p className="text-xs font-semibold text-slate-500 pl-1 tracking-wide">
            Learn. Teach. Grow.
          </p>
        </div>

        {/* 2. Middle Content: Headline, Supporting Text, and Feature Rows */}
        <div className="relative z-10 my-8 lg:my-10 space-y-8 max-w-xl">
          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#172033] tracking-tight leading-[1.15]">
              Your Learning Journey{" "}
              <span className="text-[#FF6B0A] relative inline-block">
                Starts Here
                {/* Subtle hand-drawn underline accent */}
                <svg
                  className="absolute -bottom-1.5 left-0 w-full h-2 text-[#FF6B0A]/40"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 7C30 2 70 3 98 6"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg font-normal">
              Access quality courses, expert instructors, and build the skills for a better tomorrow.
            </p>
          </div>

          {/* Three Feature Rows */}
          <div className="space-y-4 pt-1">
            {/* Feature 1: Expert Instructors */}
            <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/80 border border-orange-100/80 shadow-2xs backdrop-blur-xs transition-all hover:bg-white hover:border-orange-200">
              <div className="size-10 rounded-xl bg-orange-50 border border-orange-100 text-[#FF6B0A] flex items-center justify-center shrink-0">
                <GraduationCap className="size-5" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold text-[#172033]">Expert Instructors</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Learn 1-on-1 from verified subject matter specialists with proven exam results.
                </p>
              </div>
            </div>

            {/* Feature 2: Flexible Learning */}
            <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/80 border border-orange-100/80 shadow-2xs backdrop-blur-xs transition-all hover:bg-white hover:border-orange-200">
              <div className="size-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="size-5" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold text-[#172033]">Flexible Learning</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Book classes on your own schedule with direct Google Meet calendar integration.
                </p>
              </div>
            </div>

            {/* Feature 3: Better Opportunities */}
            <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/80 border border-orange-100/80 shadow-2xs backdrop-blur-xs transition-all hover:bg-white hover:border-orange-200">
              <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="size-5" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold text-[#172033]">Better Opportunities</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Achieve target A* grades and prepare confidently for top university entrance exams.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. High-Quality SVG Illustration: Student Studying at Laptop */}
        <div className="relative z-10 w-full max-w-lg mx-auto pt-4 flex justify-center">
          <svg
            className="w-full h-auto max-h-[220px]"
            viewBox="0 0 520 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ground / Desk Shadow */}
            <ellipse cx="260" cy="200" rx="230" ry="12" fill="#EADFD8" opacity="0.6" />

            {/* Desk Surface */}
            <rect x="70" y="170" width="380" height="12" rx="6" fill="#D8C7BC" />
            <rect x="80" y="182" width="14" height="28" rx="3" fill="#BFAF9F" />
            <rect x="426" y="182" width="14" height="28" rx="3" fill="#BFAF9F" />

            {/* Potted Plant (Left) */}
            <g transform="translate(100, 110)">
              {/* Pot */}
              <path d="M12 40 L28 40 L25 60 L15 60 Z" fill="#FF6B0A" opacity="0.9" />
              <rect x="10" y="38" width="20" height="4" rx="2" fill="#E05500" />
              {/* Leaves */}
              <path d="M20 38 Q10 20 5 24 Q8 35 20 38" fill="#16A34A" />
              <path d="M20 38 Q25 10 32 15 Q28 30 20 38" fill="#22C55E" />
              <path d="M20 38 Q35 25 38 32 Q28 38 20 38" fill="#15803D" />
            </g>

            {/* Stack of Academic Books (Left of Laptop) */}
            <g transform="translate(145, 134)">
              <rect x="0" y="24" width="45" height="10" rx="2" fill="#3B82F6" />
              <rect x="3" y="14" width="40" height="9" rx="2" fill="#F59E0B" />
              <rect x="6" y="5" width="36" height="8" rx="2" fill="#FF6B0A" />
              {/* Bookmark */}
              <path d="M30 5 L30 16 L34 13 L38 16 L38 5 Z" fill="#FFFFFF" />
            </g>

            {/* Modern Laptop on Desk */}
            <g transform="translate(210, 115)">
              {/* Screen Base */}
              <rect x="15" y="0" width="90" height="56" rx="4" fill="#1E293B" />
              {/* Screen Display with Code / ZuhDemy Chart */}
              <rect x="19" y="4" width="82" height="48" rx="2" fill="#0F172A" />
              <rect x="25" y="12" width="32" height="4" rx="2" fill="#FF6B0A" />
              <rect x="25" y="20" width="50" height="3" rx="1.5" fill="#64748B" />
              <rect x="25" y="26" width="42" height="3" rx="1.5" fill="#64748B" />
              <rect x="25" y="32" width="28" height="3" rx="1.5" fill="#38BDF8" />
              {/* Video call thumbnail of teacher */}
              <rect x="68" y="10" width="28" height="24" rx="3" fill="#1E293B" stroke="#334155" />
              <circle cx="82" cy="18" r="5" fill="#FF6B0A" />
              <path d="M74 29 C74 25 90 25 90 29" fill="#FF6B0A" />
              {/* Keyboard Base */}
              <path d="M0 55 L120 55 L110 60 L10 60 Z" fill="#94A3B8" />
            </g>

            {/* Coffee Mug with Steaming Vapor */}
            <g transform="translate(345, 142)">
              <rect x="0" y="8" width="16" height="20" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
              <path d="M16 12 Q22 12 22 18 Q22 24 16 24" fill="none" stroke="#FF6B0A" strokeWidth="2" />
              {/* Steam waves */}
              <path d="M4 4 Q6 0 4 -4" stroke="#FF6B0A" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              <path d="M11 5 Q13 1 11 -3" stroke="#FF6B0A" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            </g>

            {/* Modern Desk Lamp (Right) */}
            <g transform="translate(385, 80)">
              <path d="M30 90 L30 35 L12 25" stroke="#64748B" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M6 18 L24 28 L14 40 Z" fill="#FF6B0A" />
              {/* Warm Light Glow Cone */}
              <path d="M10 35 L-20 90 L40 90 Z" fill="#FEF08A" opacity="0.15" />
              <rect x="22" y="88" width="16" height="5" rx="2" fill="#475569" />
            </g>

            {/* Subtle Floating Learning Particles */}
            <circle cx="210" cy="80" r="3" fill="#FF6B0A" opacity="0.5" />
            <circle cx="330" cy="70" r="4" fill="#F59E0B" opacity="0.4" />
            <circle cx="160" cy="95" r="2.5" fill="#3B82F6" opacity="0.4" />
            <path d="M320 90 L323 93 L326 90 L323 87 Z" fill="#FF6B0A" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* =================================================================== */}
      {/* RIGHT PANEL: 48% WIDTH - HIGH-CONVERSION AUTHENTICATION FORM       */}
      {/* =================================================================== */}
      <div className="w-full lg:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-18 bg-white">
        {/* Top-Right: Switch to Sign Up */}
        <div className="flex items-center justify-end w-full max-w-[480px] mx-auto text-xs sm:text-sm">
          <span className="text-slate-500 font-medium mr-1.5">
            Don&apos;t have an account?
          </span>
          <Link
            href="/signup"
            className="font-bold text-[#FF6B0A] hover:text-orange-700 hover:underline transition-colors"
          >
            Sign Up
          </Link>
        </div>

        {/* Centered Form Wrapper (Constrained 480px) */}
        <div className="w-full max-w-[480px] mx-auto my-auto py-6 space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Log in to your ZuhDemy account and continue your learning journey.
            </p>
          </div>

          {/* Segmented Account-Type Selector: Student vs Teacher */}
          <div className="space-y-1.5">
            <span className="block text-2xs font-bold text-slate-500 uppercase tracking-wider">
              Select Account Role
            </span>
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleQuickDemoFill("student")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  role === "student"
                    ? "bg-white text-[#FF6B0A] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="size-4" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoFill("teacher")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  role === "teacher"
                    ? "bg-white text-[#FF6B0A] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <GraduationCap className="size-4" />
                <span>Teacher</span>
              </button>
            </div>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="user-email"
                className="block text-xs font-bold text-slate-700"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Mail className="size-4.5" />
                </div>
                <input
                  id="user-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === "teacher"
                      ? "teacher@zuhdemy.com"
                      : "student@zuhdemy.com"
                  }
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B0A] focus:ring-2 focus:ring-[#FF6B0A]/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="user-password"
                className="block text-xs font-bold text-slate-700"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="size-4.5" />
                </div>
                <input
                  id="user-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B0A] focus:ring-2 focus:ring-[#FF6B0A]/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-[#FF6B0A] focus:ring-[#FF6B0A]"
                />
                <span className="text-xs font-semibold text-slate-600">
                  Remember me
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-slate-600 hover:text-[#FF6B0A] hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Log In Button with Arrow Icon */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 sm:h-12 rounded-xl bg-[#FF6B0A] hover:bg-[#e05a00] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4.5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
              OR
            </span>
          </div>

          {/* Social Sign-in Button (Google) */}
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                router.push(role === "teacher" ? "/teacher" : "/student");
              }, 500);
            }}
            className="w-full h-11 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-3 cursor-pointer shadow-2xs"
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Bottom Legal Links */}
        <div className="w-full max-w-[480px] mx-auto pt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-100">
          <span>&copy; {new Date().getFullYear()} ZuhDemy, Inc.</span>
          <div className="flex items-center gap-3 font-semibold text-slate-500">
            <Link href="/terms" className="hover:text-[#FF6B0A] hover:underline">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[#FF6B0A] hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
