import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, GraduationCap } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline">
            <ArrowLeft className="size-4" />
            <span>Back to Login</span>
          </Link>
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5 text-orange-600" />
            <span className="font-bold text-slate-900">ZuhDemy Terms</span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900">Terms of Service</h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            Welcome to ZuhDemy. By accessing or using our student-teacher marketplace, interactive classroom services, and educational resources, you agree to comply with and be bound by these Terms of Service.
          </p>
          <h2 className="text-base font-bold text-slate-900 pt-2">1. Student and Tutor Code of Conduct</h2>
          <p>
            All users agree to interact respectfully and maintain academic integrity. Lessons are monitored for quality and safeguarding standards.
          </p>
          <h2 className="text-base font-bold text-slate-900 pt-2">2. Payments and Escrow Guarantee</h2>
          <p>
            Lesson fees are held in secure escrow and released to tutors only upon successful completion of the scheduled session. Eligible cancellations follow our student cancellation guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
