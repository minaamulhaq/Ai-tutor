"use client";

import React from "react";
import {
  Bell,
  Shield,
  Calendar,
  Clock,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { StudentProfileData } from "./types";

interface AccountSettingsTabProps {
  profile: StudentProfileData;
  onUpdateField: <K extends keyof StudentProfileData>(
    field: K,
    value: StudentProfileData[K]
  ) => void;
  onSaveProfile?: () => void;
  isSaving?: boolean;
}

export function AccountSettingsTab({
  profile,
  onUpdateField,
  onSaveProfile,
  isSaving = false,
}: AccountSettingsTabProps) {
  const updateNotifications = (
    key: keyof StudentProfileData["notifications"],
    value: boolean | number
  ) => {
    onUpdateField("notifications", {
      ...profile.notifications,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Notifications & Reminders Preferences */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Bell className="size-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Class Alerts & Notification Preferences
              </h3>
              <p className="text-xs text-slate-500">
                Control when and how you receive reminder alerts before your online sessions begin.
              </p>
            </div>
          </div>

          {onSaveProfile && (
            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={onSaveProfile}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-9 px-4 gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-center disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Save Preferences</span>
                </>
              )}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Email Reminders */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Email Reminders & Google Calendar Invites
              </span>
              <span className="text-xs text-slate-500">
                Send automatic calendar invites and session links to{" "}
                <strong className="text-slate-700">{profile.email}</strong>
              </span>
            </div>
            <Switch
              checked={profile.notifications?.emailReminders}
              onCheckedChange={(val) => updateNotifications("emailReminders", val)}
            />
          </div>

          {/* WhatsApp Alerts */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                WhatsApp Direct Meeting Alerts
              </span>
              <span className="text-xs text-slate-500">
                Receive instant 1-click meeting join links on WhatsApp (
                {profile.whatsappNumber || profile.phone || "No number provided"})
              </span>
            </div>
            <Switch
              checked={profile.notifications?.whatsappAlerts}
              onCheckedChange={(val) => updateNotifications("whatsappAlerts", val)}
            />
          </div>

          {/* Alert Window */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Pre-Class Reminder Notice Window
              </span>
              <span className="text-xs text-slate-500">
                Choose how early ZuhDemy alerts you before a confirmed class starts
              </span>
            </div>
            <Select
              value={String(profile.notifications?.classStartNoticeMinutes || 15)}
              onValueChange={(val) =>
                updateNotifications("classStartNoticeMinutes", Number(val))
              }
            >
              <SelectTrigger className="w-40 rounded-xl border-slate-200 h-9 text-xs font-semibold bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bottom Save Action */}
        {onSaveProfile && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <Button
              type="button"
              disabled={isSaving}
              onClick={onSaveProfile}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-10 px-5 gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Save Notification Preferences</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Account Info & Security Metadata */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="size-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Shield className="size-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Account Status & Student Identity
            </h3>
            <p className="text-xs text-slate-500">
              System references and student account security details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
              Account Reference
            </span>
            <p className="text-sm font-mono font-bold text-slate-900">
              {profile.accountReference}
            </p>
            <p className="text-2xs text-slate-400">Used for customer support inquiries</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
              Enrollment Status
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="size-3 mr-1 text-emerald-600" />
                {profile.accountStatus.toUpperCase()}
              </Badge>
            </div>
            <p className="text-2xs text-slate-400">Active student studio access</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
              Member Since
            </span>
            <p className="text-sm font-bold text-slate-900">
              {profile.memberSince}
            </p>
            <p className="text-2xs text-slate-400">Enrolled student account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
