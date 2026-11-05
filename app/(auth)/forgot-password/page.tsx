"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 space-y-6">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md">
            <GraduationCap className="size-5" />
          </div>
          <span className="text-xl font-black text-slate-900">
            Zuh<span className="text-orange-600">Demy</span>
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter the email associated with your ZuhDemy account and we will send a password reset link.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="size-4.5 text-emerald-600" />
              <span>Reset Email Sent</span>
            </div>
            <p className="leading-relaxed">
              If an account exists for <strong className="text-emerald-950">{email}</strong>, you will receive password reset instructions shortly.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="font-bold text-orange-600 hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="size-3" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="block text-xs font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="size-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <Input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@zuhdemy.com"
                  className="pl-10 rounded-xl border-slate-200 h-11 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Sending link...
                </>
              ) : (
                "Send Password Reset Link"
              )}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-500 hover:text-orange-600 inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="size-3" />
                <span>Back to login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
