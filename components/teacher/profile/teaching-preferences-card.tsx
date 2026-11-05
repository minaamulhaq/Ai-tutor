"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Clock,
  BadgeDollarSign,
  Video,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  Check,
  ChevronDown,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { TeacherProfileData } from "./types";
import { AVAILABLE_STUDENT_LEVELS } from "./profile-service";

interface TeachingPreferencesCardProps {
  profile: TeacherProfileData;
  onChange: (updates: Partial<TeacherProfileData>) => void;
}

export function TeachingPreferencesCard({
  profile,
  onChange,
}: TeachingPreferencesCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggleLevel = (lvl: string) => {
    if (profile.studentLevels.includes(lvl)) {
      if (profile.studentLevels.length === 1) return; // Keep at least 1
      onChange({
        studentLevels: profile.studentLevels.filter((l) => l !== lvl),
      });
    } else {
      onChange({
        studentLevels: [...profile.studentLevels, lvl],
      });
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
      {/* Dropdown / Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-6 sm:p-7 flex items-center justify-between gap-4 text-left hover:bg-slate-50/60 transition-colors cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="size-9 sm:size-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-2xs">
            <SlidersHorizontal className="size-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Teaching Preferences
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                PKR {(profile.hourlyRatePkr || 3500).toLocaleString()}/hr • 60-min sessions
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Class formats, student level brackets, session rates, and delivery settings.
            </p>
          </div>
        </div>

        <div
          className={`size-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="size-4" />
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-6 pb-7 sm:px-8 sm:pb-8 pt-0 space-y-6 border-t border-slate-100 animate-in fade-in-50 duration-150">
          {/* 1. Target Student Levels */}
          <div className="space-y-2.5 pt-6">
            <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <GraduationCap className="size-4 text-orange-500" />
              Target Student Levels
            </Label>
            <p className="text-[11px] text-slate-400">
              Select which student age and academic brackets you prefer to tutor.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {AVAILABLE_STUDENT_LEVELS.map((lvl) => {
                const isSelected = profile.studentLevels.includes(lvl);

                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleToggleLevel(lvl)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-orange-50/70 border-orange-300 text-orange-950 shadow-2xs"
                        : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{lvl}</span>
                    {isSelected ? (
                      <span className="size-4 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                        <Check className="size-2.5 stroke-3" />
                      </span>
                    ) : (
                      <span className="size-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Session Format & Duration (ZuhDemy MVP rule) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
            {/* Session Duration */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="size-3.5 text-orange-500" />
                    Session Duration
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Standard MVP
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  60 Minutes (1-on-1 Tutoring)
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                All ZuhDemy private tutoring sessions are scheduled for 1 full hour to ensure structured lesson delivery and whiteboard derivations.
              </p>
            </div>

            {/* Teaching Mode */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Video className="size-3.5 text-orange-500" />
                    Delivery Mode
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Virtual Live
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  100% Online Virtual Classroom
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Conducted online via high-definition video with screen sharing, digital whiteboard, and instant meeting launch.
              </p>
            </div>
          </div>

          {/* 3. Session Pricing & Link to Earnings */}
          <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/50 border border-orange-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="size-4.5 text-orange-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  Session Pricing Rate
                </h4>
                <span className="text-xs font-bold text-orange-600 bg-white px-2 py-0.5 rounded-md border border-orange-200">
                  PKR {(profile.hourlyRatePkr || 3500).toLocaleString()} / hr
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
                Your rate is synchronized with your class booking escrow and student checkout. Net payouts (85%) are processed to your linked bank account.
              </p>
            </div>

            <Link
              href="/teacher/earnings"
              className="inline-flex items-center gap-1.5 h-8.5 px-3.5 rounded-xl border border-orange-300 bg-white text-orange-700 hover:bg-orange-100 text-xs font-semibold shadow-2xs shrink-0 cursor-pointer transition-colors"
            >
              <span>Manage in Earnings</span>
              <ExternalLink className="size-3.5" />
            </Link>
          </div>

          {/* 4. Weekly Availability Shortcut Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4.5 text-orange-400" />
                <h4 className="font-bold text-sm text-white">
                  Weekly Availability Schedule
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
                Students book sessions based on your recurring time slots and blocked dates. Configure recurring weekly hours in My Schedule.
              </p>
            </div>

            <Link
              href="/teacher/schedule"
              className="inline-flex items-center gap-1.5 h-8.5 px-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs shrink-0 cursor-pointer transition-colors"
            >
              <span>Configure in Schedule</span>
              <span>→</span>
            </Link>
          </div>

          {/* 5. Google Meet Classroom Context */}
          <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600">
            <Video className="size-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-semibold text-slate-800">Automated Google Meet links: </span>
              When a student books a session and you confirm it in My Classes, ZuhDemy automatically generates and sends the encrypted Google Meet link to both you and the student.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
