"use client";

import React from "react";
import { Lock, Eye, ShieldCheck, UserCheck, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentSettingsState } from "../types";

interface PrivacySectionProps {
  settings: StudentSettingsState;
  onChange: <K extends keyof StudentSettingsState>(
    key: K,
    value: StudentSettingsState[K]
  ) => void;
}

export function PrivacySection({ settings, onChange }: PrivacySectionProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="size-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Lock className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Privacy & Visibility</h2>
            <p className="text-xs text-slate-500">
              Control your visibility to instructors and manage what information tutors can see.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Profile Visibility */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Profile Visibility
              </span>
              <span className="text-xs text-slate-500">
                Choose who can view your academic profile and subject requests
              </span>
            </div>
            <Select
              value={settings.profileVisibility}
              onValueChange={(val: "tutors_only" | "private") =>
                onChange("profileVisibility", val)
              }
            >
              <SelectTrigger className="w-56 rounded-xl border-slate-200 h-9 text-xs font-semibold bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutors_only">Verified Tutors Only (Recommended)</SelectItem>
                <SelectItem value="private">Private (Only Confirmed Classes)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show Target Grades */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Share Target Exam Grades with Booked Instructors
              </span>
              <span className="text-xs text-slate-500">
                Enables teachers to tailor problem sets and syllabus pacing to help you achieve your goals.
              </span>
            </div>
            <Switch
              checked={settings.showTargetGradesToTutors}
              onCheckedChange={(val) => onChange("showTargetGradesToTutors", val)}
            />
          </div>

          {/* Allow Direct Messages */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Allow Pre-Booking Inquiries from Tutors
              </span>
              <span className="text-xs text-slate-500">
                Permit instructors you contact to message you directly before booking is confirmed.
              </span>
            </div>
            <Switch
              checked={settings.allowDirectMessagesFromTutors}
              onCheckedChange={(val) => onChange("allowDirectMessagesFromTutors", val)}
            />
          </div>
        </div>

        {/* Student Protection Notice */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
          <ShieldCheck className="size-4 text-emerald-600 mt-0.5 shrink-0" />
          <span>
            <strong>ZuhDemy Student Protection:</strong> Your personal contact numbers (phone & WhatsApp) and residential location are never publicly displayed. Only confirmed class instructors can contact you for sessions.
          </span>
        </div>
      </div>
    </div>
  );
}
