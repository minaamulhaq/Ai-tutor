"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, MessageSquare, Calendar } from "lucide-react";
import { StudentProfile } from "./types";

interface StudentCardProps {
  student: StudentProfile;
}

export function StudentCard({ student }: StudentCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasAttended = student.completedClassesCount > 0;

  return (
    <div className="group relative flex flex-col justify-between p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-orange-300/80 transition-all duration-200 text-center h-full">
      {/* Top Section: Avatar & Name */}
      <div className="flex flex-col items-center w-full">
        {/* Avatar Container */}
        <div className="relative mb-3 shrink-0">
          <div className="size-20 sm:size-22 rounded-full overflow-hidden border-2 border-slate-100 shadow-xs ring-4 ring-orange-500/5 group-hover:ring-orange-500/20 transition-all bg-slate-100 flex items-center justify-center">
            {student.avatarUrl && !imgError ? (
              <img
                src={student.avatarUrl}
                alt={student.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-orange-600 bg-orange-50 text-xl select-none">
                {student.initials}
              </div>
            )}
          </div>

          {/* Active status indicator dot */}
          {student.status === "active" && (
            <span
              className="absolute bottom-0 right-0 size-3.5 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs"
              title="Active student with upcoming sessions"
            />
          )}
        </div>

        {/* Full Name */}
        <h3
          title={student.name}
          className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-orange-600 transition-colors truncate w-full px-1 leading-snug"
        >
          {student.name}
        </h3>

        {/* Subtitle: Grade Level */}
        <p className="text-xs text-slate-500 font-medium truncate w-full px-1 mt-0.5">
          {student.gradeLevel || "Student Learner"}
        </p>

        {/* Attendance Highlight Pill */}
        <div className="mt-2.5">
          {hasAttended ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              <CheckCircle2 className="size-3 text-emerald-600" />
              <span>
                {student.completedClassesCount} {student.completedClassesCount === 1 ? "Class" : "Classes"} Attended
              </span>
            </span>
          ) : student.upcomingClassesCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
              <Clock className="size-3 text-amber-600" />
              <span>{student.upcomingClassesCount} Upcoming Session</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <span>Enrolled Student</span>
            </span>
          )}
        </div>

        {/* Mini Stats Box */}
        <div className="grid grid-cols-2 gap-2 w-full mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attended</span>
            <span className="text-sm font-extrabold text-slate-800">{student.completedClassesCount}</span>
          </div>
          <div className="flex flex-col items-center border-l border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Upcoming</span>
            <span className="text-sm font-extrabold text-orange-600">{student.upcomingClassesCount}</span>
          </div>
        </div>

        {/* Last Class Date or Subjects */}
        <div className="w-full mt-3 text-left">
          {student.lastClassDate ? (
            <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1.5">
              <Calendar className="size-3 text-slate-400 shrink-0" />
              <span>
                Last class: <strong className="text-slate-700 font-semibold">{student.lastClassDate}</strong>
              </span>
            </p>
          ) : student.subjects.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {student.subjects.slice(0, 2).map((subj) => (
                <span
                  key={subj}
                  className="text-[10px] font-medium px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200/60 truncate max-w-[120px]"
                >
                  {subj}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom Section: Action Buttons */}
      <div className="grid grid-cols-2 gap-2 w-full pt-4 mt-auto">
        <Link
          href={`/teacher/messages`}
          className="flex items-center justify-center h-9 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/60 text-slate-700 hover:text-orange-600 font-semibold text-xs gap-1.5 transition-colors cursor-pointer"
          title={`Message ${student.name}`}
        >
          <MessageSquare className="size-3.5" />
          <span>Message</span>
        </Link>

        <Link
          href={`/teacher/students/${student.id}`}
          className="flex items-center justify-center h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs gap-1 shadow-2xs group-hover:shadow-md group-hover:shadow-orange-500/20 transition-all cursor-pointer"
        >
          <span>View More</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
