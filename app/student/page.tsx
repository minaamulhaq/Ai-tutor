import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Compass,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Heart,
  Video,
  ArrowRight,
  Clock,
  Sparkles,
  Calendar,
  MessageSquare,
  User,
} from "lucide-react";
import { getStudentOverviewAction } from "@/app/actions/student";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Student Dashboard Overview | ZuhDemy Learning Studio",
  description:
    "Track your scheduled 1-on-1 classes, booked hours, verified tutor lessons, and academic progress.",
};

export default async function StudentOverviewPage() {
  const res = await getStudentOverviewAction().catch(() => ({
    success: false,
    data: undefined,
  }));

  const data = res.data;
  const studentFirstName = data?.student.firstName || "Student";
  const nextClass = data?.nextClass;

  const stats = [
    {
      label: "Active Classes",
      value: `${data?.metrics.activeClassesCount ?? 0}`,
      change: `${data?.metrics.completedClassesCount ?? 0} completed`,
      icon: BookOpen,
    },
    {
      label: "Booked Hours",
      value: `${data?.metrics.bookedHours ?? 0} hrs`,
      change: "Confirmed lessons",
      icon: Clock,
    },
    {
      label: "Lessons Investment",
      value: `PKR ${(data?.metrics.totalSpentPKR ?? 0).toLocaleString()}`,
      change: "Paid in escrow",
      icon: CreditCard,
    },
    {
      label: "Learner Status",
      value: "Active Student",
      change: "1-on-1 Dedicated",
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-xl">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-none text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="size-3 mr-1" /> Student Studio
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {studentFirstName}! 👋
          </h1>
          <p className="text-sm text-orange-50/90 leading-relaxed">
            {nextClass
              ? `Ready for your next learning milestone? You have an upcoming 1-on-1 ${nextClass.subject} session ${nextClass.dateStr}.`
              : "Welcome to your learning studio! Explore verified tutors, schedule private classes, and master your academic subjects."}
          </p>
        </div>

        <Link
          href="/student/find-teachers"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-bold text-sm shadow-md transition-all shrink-0 z-10 cursor-pointer"
        >
          <Compass className="size-4" />
          <span>Find New Tutors</span>
        </Link>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-white/10 pointer-events-none" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                <div className="size-8.5 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Icon className="size-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Class Alert & Fast Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Class Card */}
        <Card className="lg:col-span-2 border-slate-200 shadow-2xs rounded-2xl flex flex-col justify-between">
          <CardHeader className="p-5 sm:p-6 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Next Upcoming Class
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {nextClass ? "1-on-1 private lesson confirmed in escrow" : "Your active schedule summary"}
              </CardDescription>
            </div>
            {nextClass && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                {nextClass.dateStr}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="p-5 sm:p-6 flex-1 flex flex-col justify-center">
            {nextClass ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-12 rounded-xl ring-2 ring-orange-500/20 shrink-0">
                      <AvatarImage
                        src={nextClass.teacher.avatarUrl || undefined}
                        alt={nextClass.teacher.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-xl bg-orange-100 text-orange-800 font-bold text-sm">
                        {nextClass.teacher.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {nextClass.topicTitle}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        with <span className="font-semibold text-slate-700">{nextClass.teacher.name}</span> • {nextClass.durationMinutes} Mins
                      </p>
                    </div>
                  </div>

                  {nextClass.meetingUrl ? (
                    <a
                      href={nextClass.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 h-9.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      <Video className="size-4" />
                      <span>Join Google Meet</span>
                    </a>
                  ) : (
                    <Link
                      href="/student/classes"
                      className="inline-flex items-center justify-center gap-2 h-9.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      <BookOpen className="size-4" />
                      <span>View Details</span>
                    </Link>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>
                    Class rate: <strong className="text-slate-800">PKR {nextClass.pricePkr.toLocaleString()}</strong>
                  </span>
                  <Link href="/student/classes" className="text-orange-600 font-semibold hover:underline flex items-center gap-1">
                    <span>View all schedule</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <div className="size-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                  <CalendarCheck className="size-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">No Upcoming Classes Scheduled</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You do not have any confirmed 1-on-1 lessons booked right now. Explore top-rated instructors to schedule your next session!
                  </p>
                </div>
                <Link
                  href="/student/find-teachers"
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Compass className="size-3.5" />
                  <span>Browse Top Tutors</span>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Shortcuts Card */}
        <Card className="border-slate-200 shadow-2xs rounded-2xl">
          <CardHeader className="p-5 sm:p-6 border-b border-slate-100">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
              Quick Shortcuts
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Frequent actions & portals
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-2.5">
            <Link
              href="/student/find-teachers"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 text-xs font-semibold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="size-4 text-orange-500" />
                <span>Browse Verified Teachers</span>
              </div>
              <ArrowRight className="size-3.5 text-slate-400" />
            </Link>

            <Link
              href="/student/classes"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 text-xs font-semibold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="size-4 text-blue-500" />
                <span>My Classes & Bookings</span>
              </div>
              <ArrowRight className="size-3.5 text-slate-400" />
            </Link>

            <Link
              href="/student/messages"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 text-xs font-semibold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="size-4 text-purple-500" />
                <span>Direct Tutor Messages</span>
              </div>
              <ArrowRight className="size-3.5 text-slate-400" />
            </Link>

            <Link
              href="/student/payments"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 text-xs font-semibold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="size-4 text-emerald-500" />
                <span>Payment Invoices & Receipts</span>
              </div>
              <ArrowRight className="size-3.5 text-slate-400" />
            </Link>

            <Link
              href="/student/profile"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 text-xs font-semibold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <User className="size-4 text-amber-500" />
                <span>Academic Profile & Goals</span>
              </div>
              <ArrowRight className="size-3.5 text-slate-400" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

