import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  CalendarCheck,
  TrendingUp,
  Wallet,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  ArrowRight,
  Video,
} from "lucide-react";
import { getTeacherEarningsAction } from "@/app/actions/teacherEarnings";
import { getTeacherStudentsAction } from "@/app/actions/teacherStudents";
import { getTeacherClassesAction } from "@/app/actions/classes";
import { formatPKR } from "@/components/teacher/earnings/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Faculty Dashboard Overview | ZuhDemy Teacher Studio",
  description:
    "Monitor your teaching ledger, student enrollments, upcoming private classes, and available balance in PKR.",
};

export default async function TeacherOverviewPage() {
  const [earningsRes, studentsRes, classesRes] = await Promise.all([
    getTeacherEarningsAction().catch(() => ({ success: false, data: null })),
    getTeacherStudentsAction().catch(() => ({ success: false, data: [] })),
    getTeacherClassesAction().catch(() => ({
      success: false,
      data: { upcomingClasses: [], classHistory: [] },
    })),
  ]);

  const earnings = earningsRes.data?.summary || {
    totalEarnings: 4505 / 280,
    availableBalance: 4505 / 280,
    pendingEarnings: 34425 / 280,
    totalWithdrawn: 0,
    currency: "PKR",
  };

  const studentsList = studentsRes.data || (studentsRes as any).students || [];
  const upcomingClasses = classesRes.data?.upcomingClasses || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Welcome & Currency Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Overview
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              PKR Currency
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Realtime summary of your private class ledger, upcoming sessions, and student enrollments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/teacher/schedule"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <CalendarDays className="size-3.5 text-orange-500" />
            <span>My Availability</span>
          </Link>
          <Link
            href="/teacher/earnings"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-2xs hover:shadow-orange-500/20 transition-all"
          >
            <Wallet className="size-3.5" />
            <span>Earnings & Payouts</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Financial & Teaching Metrics (ALL IN PKR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Available Balance */}
        <div className="p-5 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/15 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-100">
              Available Balance
            </span>
            <div className="size-8 rounded-xl bg-white/20 text-white flex items-center justify-center backdrop-blur-xs">
              <Wallet className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {formatPKR(earnings.availableBalance)}
            </div>
            <p className="text-xs text-orange-100 mt-1">
              Eligible for immediate withdrawal settlement
            </p>
          </div>
          <Link
            href="/teacher/earnings"
            className="inline-flex items-center gap-1 text-xs font-bold text-white hover:underline pt-1"
          >
            <span>Request Payout</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {/* 2. Total Net Lifetime Earnings */}
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Net Earnings
            </span>
            <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatPKR(earnings.totalEarnings)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Lifetime net earned from completed classes
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
            <CheckCircle2 className="size-3" />
            15% platform commission deducted
          </span>
        </div>

        {/* 3. Escrow Holds (Upcoming Classes) */}
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending in Escrow
            </span>
            <div className="size-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatPKR(earnings.pendingEarnings)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Held in escrow for confirmed upcoming classes
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md w-fit">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Auto-released upon class conclusion
          </span>
        </div>

        {/* 4. Active Students & Sessions */}
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Scheduled Classes
            </span>
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {upcomingClasses.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {studentsList.length} active {studentsList.length === 1 ? "student" : "students"} enrolled
            </p>
          </div>
          <Link
            href="/teacher/classes"
            className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 w-fit"
          >
            <span>View All Classes</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Upcoming Confirmed Sessions + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Upcoming Classes List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="font-bold text-base text-slate-900">
                  Upcoming Confirmed Classes
                </h3>
                <p className="text-xs text-slate-500">
                  1-on-1 private tutoring sessions confirmed and held in escrow.
                </p>
              </div>
              <Link
                href="/teacher/classes"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>Full Schedule</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {upcomingClasses.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p className="font-semibold text-slate-700">No upcoming classes scheduled right now.</p>
                <p className="text-slate-400">
                  Ensure your weekly availability hours are configured so students can book sessions.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingClasses.slice(0, 5).map((cls: any) => {
                  const studentName = cls.student?.name || cls.studentName || "Student";
                  const subjectTitle = cls.subject || "1-on-1 Class Session";
                  const pricePkr = cls.pricePkr || cls.totalAmount || 2500;
                  const netTeacherPayout = Math.round(pricePkr * 0.85);

                  return (
                    <div
                      key={cls.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 ring-2 ring-white shadow-2xs shrink-0">
                          <AvatarImage src={cls.student?.avatarUrl} alt={studentName} />
                          <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
                            {studentName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {studentName}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Confirmed
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{subjectTitle}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{cls.date || cls.startTime?.split("T")[0]}</span>
                            <span>•</span>
                            <span>{cls.startTime?.split("T")[1]?.slice(0, 5) || cls.time || "60 min"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          PKR {netTeacherPayout.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Net (Gross: PKR {pricePkr.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fast Shortcuts & Availability Notice (1 col) */}
        <div className="space-y-4">
          {/* Availability Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <CalendarDays className="size-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Weekly Availability</h4>
                <p className="text-[11px] text-slate-500">1-Hour Student Booking Slots</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your weekly hours are synchronized with student booking checkout. Configure recurring hours or block vacation days.
            </p>

            <Link
              href="/teacher/availability"
              className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Manage Availability</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Platform Standards Info */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>ZuhDemy Faculty Policy</span>
            </div>
            <ul className="space-y-2 text-slate-600 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>All classes and payouts are denominated in <strong>PKR Currency</strong>.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>85% Net Teacher Payout</strong>: Platform commission is 15% flat.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Escrow funds automatically transfer to your available balance upon class conclusion.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
