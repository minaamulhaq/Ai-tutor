"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  KeyRound,
  Bell,
  Calendar,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { TeacherProfileData } from "./types";

interface AccountInfoCardProps {
  profile: TeacherProfileData;
}

export function AccountInfoCard({ profile }: AccountInfoCardProps) {
  const [isOpen, setIsOpen] = useState(true);

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
            <ShieldCheck className="size-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Account & Security Settings
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active & Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Faculty credentials, authentication shortcuts, and notification alerts.
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
          {/* Info Grid (4 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-6">
            {/* 1. Account Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 block">
                Account Status
              </span>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-xs sm:text-sm font-bold text-slate-900 capitalize">
                  {profile.accountStatus} & Active
                </span>
              </div>
            </div>

            {/* 2. Email Verification */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 block">
                Email Verification
              </span>
              <div className="flex items-center gap-1.5 text-emerald-700">
                <ShieldCheck className="size-3.5" />
                <span className="text-xs sm:text-sm font-bold">Verified</span>
              </div>
            </div>

            {/* 3. Member Since */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 block">
                Member Since
              </span>
              <div className="flex items-center gap-1.5 text-slate-800">
                <Calendar className="size-3.5 text-slate-500" />
                <span className="text-xs sm:text-sm font-bold">{profile.memberSince}</span>
              </div>
            </div>

            {/* 4. Faculty Reference ID */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 block">
                Faculty Reference ID
              </span>
              <div className="flex items-center gap-1.5 text-slate-800">
                <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-orange-600">
                  {profile.accountReference}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Shortcuts to Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {/* Password & Security Shortcut */}
            <Link
              href="/teacher/settings"
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between group transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
                  <KeyRound className="size-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                    Password & Security
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Change password, 2FA, and login sessions
                  </p>
                </div>
              </div>
              <ExternalLink className="size-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </Link>

            {/* Notification Settings Shortcut */}
            <Link
              href="/teacher/settings"
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between group transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/80 flex items-center justify-center shrink-0">
                  <Bell className="size-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                    Notification Preferences
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Email and SMS booking alerts
                  </p>
                </div>
              </div>
              <ExternalLink className="size-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
