"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Video,
  Mail,
  Target,
  Lightbulb,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentProfile } from "./types";
import { ClassSession, formatPKR } from "@/components/teacher/classes/types";

interface StudentOverviewTabProps {
  student: StudentProfile;
  classes: ClassSession[];
}

export function StudentOverviewTab({
  student,
  classes,
}: StudentOverviewTabProps) {
  // Find next upcoming class (status === 'confirmed' or 'pending')
  const upcomingClasses = classes
    .filter((c) => c.status === "confirmed" || c.status === "pending")
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextClass = upcomingClasses[0];

  // Find most recent completed class
  const completedClasses = classes
    .filter((c) => c.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date));
  const lastCompletedClass = completedClasses[0];

  // Helper date formatter
  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const trimmed = String(timeStr).trim();
    if (/AM|PM/i.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.includes("T")) {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        return new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Karachi",
        }).format(d);
      }
    }
    try {
      const parts = trimmed.split(":");
      let h = parseInt(parts[0], 10);
      let m = parseInt(parts[1] || "0", 10);
      if (isNaN(h)) h = 0;
      if (isNaN(m)) m = 0;
      const period = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 || 12;
      const minStr = m < 10 ? `0${m}` : `${m}`;
      return `${hour12}:${minStr} ${period}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Total Sessions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Classes
            </span>
            <div className="size-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <GraduationCap className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {student.totalClassesCount}
          </div>
          <p className="text-xs text-slate-400">Total sessions booked with you</p>
        </div>

        {/* Completed Sessions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Completed
            </span>
            <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {student.completedClassesCount}
          </div>
          <p className="text-xs text-slate-400">Successfully conducted classes</p>
        </div>

        {/* Upcoming Sessions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Upcoming
            </span>
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {student.upcomingClassesCount}
          </div>
          <p className="text-xs text-slate-400">Scheduled on your calendar</p>
        </div>
      </div>

      {/* Main Grid: Student Profile Details & Learning Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Learning Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <BookOpen className="size-4.5 text-orange-500" />
              <h3 className="font-bold text-base text-slate-900">
                Academic & Learning Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className="text-slate-400 block text-xs">Email Address</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Mail className="size-3.5 text-slate-400" />
                  {student.email}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block text-xs">Education Level</span>
                <span className="font-semibold text-slate-800">
                  {student.gradeLevel || "Standard Curriculum"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block text-xs">First Booked Date</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(student.enrolledSince)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block text-xs">Relationship Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize bg-slate-100 text-slate-700">
                  {student.status === "active" ? "Active Learner" : "Past Student"}
                </span>
              </div>
            </div>

            {/* Academic Goals */}
            {student.targetGoals && (
              <div className="pt-2">
                <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-100/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950 uppercase tracking-wide">
                    <Target className="size-3.5 text-orange-600" />
                    <span>Academic Goals</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {student.targetGoals}
                  </p>
                </div>
              </div>
            )}

            {/* Learning Preferences */}
            {student.learningPreferences && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                  <Lightbulb className="size-3.5 text-orange-500" />
                  <span>Learning Preferences & Coaching Needs</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {student.learningPreferences}
                </p>
              </div>
            )}

            {/* Subjects Studied with Teacher */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide">
                Subjects Studied With You
              </span>
              <div className="flex flex-wrap gap-2">
                {student.subjects.map((subj) => (
                  <Badge
                    key={subj}
                    variant="secondary"
                    className="bg-orange-50 text-orange-700 border-orange-200 font-medium text-xs px-3 py-1"
                  >
                    {subj}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Next Class & Most Recent Session */}
        <div className="space-y-6">
          {/* Next Scheduled Class Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Next Upcoming Session
              </span>
              {nextClass && (
                <Badge
                  variant="outline"
                  className={
                    nextClass.status === "confirmed"
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px]"
                      : "text-amber-700 bg-amber-50 border-amber-200 text-[10px]"
                  }
                >
                  {nextClass.status}
                </Badge>
              )}
            </div>

            {nextClass ? (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {nextClass.topicTitle}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {nextClass.subject} · {nextClass.durationMinutes} mins
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5 text-orange-500 shrink-0" />
                    <span>{formatDate(nextClass.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-slate-400 shrink-0" />
                    <span>
                      {formatTime(nextClass.startTime)} – {formatTime(nextClass.endTime)}
                    </span>
                  </div>
                </div>

                {nextClass.meetingUrl && nextClass.status === "confirmed" && (
                  <Button
                    size="sm"
                    onClick={() => window.open(nextClass.meetingUrl, "_blank")}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs h-8.5 rounded-xl gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Video className="size-3.5" />
                    <span>Join Online Classroom</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-1">
                <Calendar className="size-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  No upcoming classes scheduled.
                </p>
              </div>
            )}
          </div>

          {/* Most Recent Completed Class Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Most Recent Completed Class
            </span>

            {lastCompletedClass ? (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {lastCompletedClass.topicTitle}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {lastCompletedClass.subject} · Completed {formatDate(lastCompletedClass.date)}
                  </p>
                </div>

                {lastCompletedClass.teacherNotes && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700 block mb-0.5">
                      Teacher Lesson Notes:
                    </span>
                    {lastCompletedClass.teacherNotes}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-1">
                <CheckCircle2 className="size-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  No completed sessions yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
