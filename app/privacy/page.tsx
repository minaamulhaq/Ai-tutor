import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, GraduationCap } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline">
            <ArrowLeft className="size-4" />
            <span>Back to Login</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" />
            <span className="font-bold text-slate-900">ZuhDemy Privacy</span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            At ZuhDemy, protecting your personal data, guardian information, and learning records is our top priority.
          </p>
          <h2 className="text-base font-bold text-slate-900 pt-2">1. Data Confidentiality</h2>
          <p>
            Student contact numbers (phone & WhatsApp) and residential locations are never publicly disclosed. Only verified instructors assigned to your confirmed classes receive lesson coordination details.
          </p>
          <h2 className="text-base font-bold text-slate-900 pt-2">2. Secure Sessions</h2>
          <p>
            All video sessions are encrypted end-to-end via secure Google Meet integration. We do not store or sell your private video data.
          </p>
        </div>
      </div>
    </div>
  );
}
